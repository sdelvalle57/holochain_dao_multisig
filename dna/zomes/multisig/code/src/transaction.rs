/************************ Import Required Libraries */
use hdk::{
    entry_definition::ValidatingEntryType,
    error::{ZomeApiError, ZomeApiResult},
    AGENT_ADDRESS, DNA_ADDRESS, PUBLIC_TOKEN,
};

use hdk::holochain_core_types::{
    dna::entry_types::Sharing,
    signature::{Provenance, Signature},
    time::Timeout,
    entry::Entry,
    validation::{
        EntryValidationData,
        LinkValidationData
    },
};
use holochain_wasm_utils::api_serialization::{
    get_entry::{GetEntryOptions, GetEntryResult},
    get_links::GetLinksOptions,
};

use hdk::holochain_json_api::{error::JsonError, json::JsonString};
use hdk::holochain_persistence_api::cas::content::Address;
use hdk::prelude::{
    GetEntryResultType,
    StatusRequestKind,
    LinkMatch,
    AddressableContent
};
use hdk::ValidationData;
use std::convert::TryFrom;
use serde_json::json;

use crate::{
    multisig,
    member
};
/******************************************* */

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Transaction {
    title: String,
    description: String,
    required: u64,
    pub signed: Vec<VerifiedMember>,
    creator: member::Member,
    pub executed: bool,
    data: Entry,
    entry_address: Option<Address>
}

impl Transaction {
    pub fn new(title: String, description: String, required: u64, signer: VerifiedMember, data: Entry) -> Self {
        Transaction {
            title,
            description,
            required,
            signed: vec![signer.clone()],
            creator: signer.member,
            executed: false,
            data,
            entry_address: None
        }
    }

    pub fn get(address: Address) -> ZomeApiResult<Self> {
        hdk::utils::get_as_type(address.to_string().into())
    }

    pub fn entry(&self) -> Entry {
        Entry::App("transaction".into(), self.into())
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct VerifiedMember {
    pub member: member::Member,
    signature: Option<String>
}

impl VerifiedMember {
    pub fn new(member: member::Member, signature: Option<String>) -> Self {
        VerifiedMember {
            member,
            signature
        }
    }
}

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name: "transaction",
        description: "this is the transaction entry def",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | validation_data: hdk::EntryValidationData<Transaction> | {
            match validation_data {
                EntryValidationData::Create { .. } => {
                    member::get_member(AGENT_ADDRESS.clone())?;
                    Ok(())
                },
                EntryValidationData::Modify { old_entry, .. } => {
                    member::get_member(AGENT_ADDRESS.clone())?;
                    if old_entry.executed {
                        return Err(String::from("Cannot delete entry, entry already executed"));
                    }
                    Ok(())
                },
                EntryValidationData::Delete { old_entry, .. } => {
                    member::get_member(AGENT_ADDRESS.clone())?;
                    if old_entry.executed {
                        return Err(String::from("Cannot delete entry, entry already executed"));
                    } else if old_entry.signed.len() > 1 {
                        return Err(String::from("Cannot delete entry, already signed for more than one members"));
                    } else if old_entry.signed.len() == 0 && old_entry.creator.address != AGENT_ADDRESS.clone() {
                        return Err(String::from("Cannot delete entry, signer is not creator"));
                    }
                    Ok(())
                }
            }
        },
        links: [
            from!(
                "%agent_id",
                link_type: "member->transactions",
                validation_package: || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: | _valudation_data: hdk::LinkValidationData | {
                    Ok(())
                } 
            )
        ]
    )
}

pub fn submit(title: String, description: String, entry: Entry) -> ZomeApiResult<Address> {
    let signer = member::get_member(AGENT_ADDRESS.clone())?;
    let multisig = multisig::get_multisig()?;
    
    let entry_string = entry_to_string(entry.clone())?;
    let signature = hdk::sign(entry_string)?;
    let verified_member = VerifiedMember::new(signer, Some(signature));

    let new_tx = Transaction::new(title, description, multisig.required, verified_member, entry);
    let new_tx_entry = new_tx.entry();
    
    let new_tx_address = hdk::commit_entry(&new_tx_entry)?;
    let multisig_address = multisig::get_multisig_address()?;
    hdk::link_entries(&AGENT_ADDRESS, &new_tx_address, "member->transactions", "")?;
    hdk::link_entries(&multisig_address, &new_tx_address, "multisig->transactions", "")?;
    
    Ok(new_tx_address)
}

pub fn sign_entry(entry_address: Address) -> ZomeApiResult<Address> {
    let member = member::get_member(AGENT_ADDRESS.clone())?;

    let transaction = Transaction::get(entry_address.clone())?;
    let entry_string = entry_to_string(transaction.data.clone())?;
    let signature = hdk::sign(entry_string)?;
    let verified_member = VerifiedMember::new(member, Some(signature));

    let mut new_transaction = transaction.clone();
    new_transaction.signed.push(verified_member);
    let new_transaction_entry = new_transaction.entry();
    hdk::update_entry(new_transaction_entry, &entry_address)?;
    hdk::link_entries(&AGENT_ADDRESS, &entry_address, "member->transactions", "")?;
    Ok(entry_address)
}


pub fn execute_transaction(entry_address: Address) -> ZomeApiResult<Address> {
    member::get_member(AGENT_ADDRESS.clone())?;
    let mut transaction = Transaction::get(entry_address.clone())?;
    let can_execute = can_execute(&transaction);
    match can_execute {
        Some(err) => return Err(err),
        None =>  {
            let data: Entry = transaction.clone().data;
            let data_address = hdk::commit_entry(&data)?;
            transaction.executed = true;
            transaction.entry_address = Some(data_address);
            let transaction_entry = transaction.entry();
            hdk::update_entry(transaction_entry.clone(), &entry_address)?;
            return Ok(entry_address)
        }
    }
}

fn can_execute(transaction: &Transaction) -> Option<ZomeApiError> {
    if transaction.signed.clone().len() < transaction.required as usize {
        return Some(ZomeApiError::Internal("Cannot execute transaction".into()));
    } 
    if transaction.executed  {
        return Some(ZomeApiError::Internal("Transaction already executed".into()));
    }
    for verified_member in &transaction.signed {
        if verified_member.member.address == AGENT_ADDRESS.clone() {
            // No error.transaction can be executed
            return None
        }
    }
    Some(ZomeApiError::Internal("Member has not signed the transaction".into()))
}

fn verify_signature(entry_data: Entry, verified_member: VerifiedMember) -> ZomeApiResult<Option<String>> {
    let signature = verified_member.signature.unwrap();
    let member_address = verified_member.member.address;
    let entry_string = entry_to_string(entry_data)?;
    let provenance = Provenance::new(member_address, Signature::from(signature.clone()));
    let verified = hdk::verify_signature(provenance, entry_string)?;
    if verified {
        return Ok(Some(signature.clone()));
    }
    Ok(None)
}

fn entry_to_string(entry: Entry) -> ZomeApiResult<String> {
    let json_entry = JsonString::try_from(&entry).unwrap();
    Ok(json_entry.to_string())
}

//Clones the transaction and verifies each member who has signed it
pub fn get(entry_address: Address) -> ZomeApiResult<Transaction> {
    member::get_member(AGENT_ADDRESS.clone())?;
    let transaction: Transaction = Transaction::get(entry_address)?;
    let mut transaction_response = transaction.clone();
    transaction_response.signed = Vec::default();
    for verified_member in transaction.signed {
        let member = verified_member.member.clone();
        let signature = verify_signature(transaction.data.clone(), verified_member)?;
        let new_verified_member = VerifiedMember::new(member, signature);
        transaction_response.signed.push(new_verified_member);
    }
    Ok(transaction_response)
}

pub fn list() -> ZomeApiResult<Vec<Address>> {
    member::get_member(AGENT_ADDRESS.clone())?;
    let multisig_address = multisig::get_multisig_address()?;
    let links = hdk::get_links(
        &multisig_address, 
        LinkMatch::Exactly("multisig->transactions"), 
        LinkMatch::Any
    )?;
    Ok(links.addresses())
}

pub fn member_list() -> ZomeApiResult<Vec<Address>> {
    member::get_member(AGENT_ADDRESS.clone())?;
    let links = hdk::get_links(
        &AGENT_ADDRESS, 
        LinkMatch::Exactly("member->transactions"), 
        LinkMatch::Any
    )?;
    hdk::debug(format!("links_member {:?}", links))?;
    Ok(links.addresses())
}






// fn get_signature(entry_address: Address, agent: Address) -> ZomeApiResult<Option<String>> {
//     let option = GetEntryOptions::new(StatusRequestKind::Latest, true, true, Timeout::default());
//     let entry_result = hdk::get_entry_result(&entry_address, option)?;
//     hdk::debug(format!("entry_address_option {:?}", &entry_result))?;
//     let signature = hdk::sign(entry_address.clone())?;
//     let my_provenance = Provenance::new(agent.clone(), Signature::from(signature.clone()));

//     if let GetEntryResultType::Single(item) = entry_result.result {
//         for header in item.headers {
//             for i in header.provenances().iter() {
//                 if JsonString::from(i).to_string() == JsonString::from(&my_provenance).to_string() {
//                     return Ok(Some(signature));
//                 }
//             }
//         }
//         return Ok(None);
//     }
//     return Ok(None);
// }

// Helper for handling decoding of entry data to requested entry struct type
// pub (crate) fn try_decode_entry<R>(entry: ZomeApiResult<Option<Entry>>) -> ZomeApiResult<Option<R>>
//     where R: TryFrom<AppEntryValue>,
// {
//     match entry {
//         Ok(Some(AppEntry(_, entry_value))) => {
//             match R::try_from(entry_value.to_owned()) {
//                 Ok(val) => Ok(Some(val)),
//                 Err(_) => Err(ZomeApiError::Internal("ERR_MSG_ENTRY_WRONG_TYPE".to_string())),
//             }
//         },
//         _ => Err(ZomeApiError::Internal("ERR_MSG_ENTRY_NOT_FOUND".to_string())),
//     }
// }

// GetEntryOptions
// {
// 	result: Single(GetEntryResultItem {
// 		meta: Some(EntryResultMeta {
// 			address: HashString("QmS4UvP4FDGbQvY7fV21wDfZ2bRcnGe8YADUYE2GThDaVt"),
// 			entry_type: App(AppEntryType("transaction")),
// 			crud_status: Live
// 		}),
// 		entry: Some(App(AppEntryType("transaction"), JsonString("{\"title\":\"add_member\",\"description\":\"Add bob as member\",\"required\":1,\"signed\":[\"HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui\"],\"creator\":\"HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui\",\"executed\":false,\"data\":{\"App\":[\"member\",\"{\\\"name\\\":\\\"Bob\\\",\\\"address\\\":\\\"HcScj5GbxXdTq69sfnz3jcA4u5f35zftsuu5Eb3dBxHjgd9byUUW6JmN3Bvzqqr\\\"}\"]}}"))),
// 		headers: [ChainHeader {
// 			entry_type: App(AppEntryType("transaction")),
// 			entry_address: HashString("QmS4UvP4FDGbQvY7fV21wDfZ2bRcnGe8YADUYE2GThDaVt"),
// 			provenances: [Provenance(HashString("HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui"), Signature("jP6KguBjYwH9Ph6ITQpePUasB1vaS6Qu1syNKLsRzeuBnKrRdrZiyC3JTYVs4EYu8cPqYGrww/HC6478lLMgAg=="))],
// 			link: Some(HashString("QmXUT73GrPkt84azJ1giDyac4kX9GS5w8Wmv9LNMqs4oGN")),
// 			link_same_type: None,
// 			link_update_delete: None,
// 			timestamp: Iso8601(2020 - 04 - 08 T06: 36: 32 + 00: 00)
// 		}]
// 	})
// }