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

use structures::{
    LinkData,
    EntryAction,
    LinkAction
};

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
    multisig_address: Address,
    pub signed: Vec<VerifiedMember>,
    creator: member::Member,
    pub executed: bool,
    entry_data: Entry,
    entry_action: EntryAction,
    entry_links: Option<Vec<LinkData>>, 
    response_address: Option<Address>,
}



impl Transaction {
    pub fn new(
        title: String, 
        description: String, 
        required: u64, 
        multisig_address: Address,
        signer: VerifiedMember, 
        entry_data: Entry, 
        entry_action: EntryAction,
        entry_links: Option<Vec<LinkData>>
    ) -> Self {
        Transaction {
            title,
            description,
            required,
            multisig_address,
            signed: vec![signer.clone()],
            creator: signer.member,
            executed: false,
            entry_data,
            entry_action,
            entry_links,
            response_address: None
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
                    member::get_member(AGENT_ADDRESS.clone(), multisig::get_multisig_address()?)?;
                    Ok(())
                },
                EntryValidationData::Modify { old_entry, .. } => {
                    member::get_member(AGENT_ADDRESS.clone(), multisig::get_multisig_address()?)?;
                    if old_entry.executed {
                        return Err(String::from("Cannot modify entry, entry already executed"));
                    }
                    
                    Ok(())
                },
                EntryValidationData::Delete { old_entry, .. } => {
                    member::get_member(AGENT_ADDRESS.clone(), multisig::get_multisig_address()?)?;
                    if old_entry.executed {
                        return Err(String::from("Cannot delete entry, entry already executed"));
                    } else if old_entry.signed.len() > 1 {
                        return Err(String::from("Cannot delete entry, already signed for more than one members"));
                    } else if old_entry.signed.len() == 0 && old_entry.creator.member.address != AGENT_ADDRESS.clone() {
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

pub fn submit(
    title: String, 
    description: String, 
    entry_data: Entry,
    entry_action: EntryAction,
    entry_links: Option<Vec<LinkData>>, 
    multisig_address: Address
) -> ZomeApiResult<Address> {
    let signer = member::get_member(AGENT_ADDRESS.clone(), multisig_address.clone())?;
    let multisig = multisig::get_multisig(multisig_address.clone())?;
    
    //TODO: also sign entry_action
    let data_to_string = data_to_string(entry_data.clone(), entry_links.clone())?;

    let signature = hdk::sign(data_to_string)?;
    let verified_member = VerifiedMember::new(signer, Some(signature));

    let new_tx = Transaction::new(
        title, 
        description, 
        multisig.required, 
        multisig_address.clone(),
        verified_member, 
        entry_data, 
        entry_action,
        entry_links
    );
    
    let new_tx_entry = new_tx.entry();
    
    let new_tx_address = hdk::commit_entry(&new_tx_entry)?;
    hdk::link_entries(&AGENT_ADDRESS, &new_tx_address, "member->transactions", "")?;
    hdk::link_entries(&multisig_address, &new_tx_address, "multisig->transactions", "")?;
    
    Ok(new_tx_address)
}

pub fn sign_entry(entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    let member = member::get_member(AGENT_ADDRESS.clone(), multisig_address)?;
    let transaction = Transaction::get(entry_address.clone())?;

    for verified_member in transaction.clone().signed {
        if verified_member.member.member.address == AGENT_ADDRESS.clone() {
            return Err(ZomeApiError::from(String::from("User has already signed the transaction")));
        }
    }

    let data_to_string = data_to_string(transaction.entry_data.clone(), transaction.entry_links.clone())?;
    let signature = hdk::sign(data_to_string)?;
    
    let verified_member = VerifiedMember::new(member, Some(signature));

    let mut new_transaction = transaction.clone();
    new_transaction.signed.push(verified_member);
    let new_transaction_entry = new_transaction.entry();
    hdk::update_entry(new_transaction_entry, &entry_address)?;
    hdk::link_entries(&AGENT_ADDRESS, &entry_address, "member->transactions", "")?;
    Ok(entry_address)
}

pub fn execute_transaction(entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    member::get_member(AGENT_ADDRESS.clone(), multisig_address)?;
    let mut transaction = Transaction::get(entry_address.clone())?;
    let can_execute = can_execute(&transaction.clone());
    match can_execute {
        Some(err) => return Err(err),
        None =>  {
            let data: Entry = transaction.entry_data.clone();
            let data_address;
            match transaction.entry_action.clone() {
                EntryAction::COMMIT => {
                    data_address = hdk::commit_entry(&data)?;
                },
                EntryAction::UPDATE(base_address) => {
                    data_address = hdk::update_entry(data, &base_address)?; 
                },
                EntryAction::REMOVE(target_address) => {
                    data_address = hdk::remove_entry(&target_address)?;
                }
            }
            transaction.executed = true;
            transaction.response_address = Some(data_address.clone());
            let transaction_entry = transaction.entry();
            hdk::update_entry(transaction_entry.clone(), &entry_address)?;
            
            let mut base_link_data = data_address.clone();
            let mut target_link_data = data_address.clone();
            let mut tag_link_data = "".to_string();

            match transaction.entry_links {
                Some(links) => { 
                    for link in links {
                        match link.base {
                            Some(base) => base_link_data = base.clone(),
                            _ => (),
                       }
                       match link.target {
                           Some(target) => target_link_data = target.clone(),
                            _ => (),
                       }
                       match link.link_tag {
                           Some(tag) => tag_link_data = tag,
                           _ => ()
                       }
                       match link.action {
                           LinkAction::ADD => {
                                hdk::link_entries(&base_link_data, &target_link_data, link.link_type, tag_link_data.clone())?;
                           }
                           LinkAction::REMOVE => {
                                hdk::remove_link(&base_link_data, &target_link_data, link.link_type, tag_link_data.clone())?;
                           }
                       }
                    }
                },
                None => ()
            }
            return Ok(entry_address);
        }
    }
}

fn data_to_string(entry_data: Entry, entry_links: Option<Vec<LinkData>>) -> ZomeApiResult<String> {
    let mut data_s = String::from(JsonString::try_from(entry_data).unwrap());
    if let Some(links) = entry_links {
        let mut all_links = String::from("");
        for link in links {
            all_links = format!("{}{}", all_links, String::from(JsonString::try_from(link).unwrap()));
        }
        data_s = format!("{}{}", data_s, all_links);
    }
    Ok(data_s)
}

fn can_execute(transaction: &Transaction) -> Option<ZomeApiError> {
    if transaction.signed.clone().len() < transaction.required as usize {
        return Some(ZomeApiError::Internal("Cannot execute transaction".into()));
    } 
    if transaction.executed  {
        return Some(ZomeApiError::Internal("Transaction already executed".into()));
    }
    for verified_member in &transaction.signed {
        if verified_member.member.member.address == AGENT_ADDRESS.clone() {
            // No error.transaction can be executed
            return None
        }
    }
    Some(ZomeApiError::Internal("Member has not signed the transaction".into()))
}

fn verify_signature(transaction: Transaction, verified_member: VerifiedMember) -> ZomeApiResult<Option<String>> {
    let signature = verified_member.signature.unwrap();
    let member_address = verified_member.member.member.address;
    let data_to_string = data_to_string(transaction.entry_data, transaction.entry_links)?;
    let provenance = Provenance::new(member_address, Signature::from(signature.clone()));
    let verified = hdk::verify_signature(provenance, data_to_string)?;
    if verified {
        return Ok(Some(signature.clone()));
    }
    Ok(None)
}


//Clones the transaction and verifies each member who has signed it
pub fn get(entry_address: Address) -> ZomeApiResult<Transaction> {
    let transaction: Transaction = Transaction::get(entry_address)?;
    member::get_member(AGENT_ADDRESS.clone(), transaction.multisig_address.clone())?;
    let mut transaction_response = transaction.clone();
    transaction_response.signed = Vec::default();
    for verified_member in transaction.clone().signed {
        let member = verified_member.member.clone();
        let signature = verify_signature(transaction.clone(), verified_member)?;
        let new_verified_member = VerifiedMember::new(member, signature);
        transaction_response.signed.push(new_verified_member);
    }
    Ok(transaction_response)
}

pub fn list(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
    member::get_member(AGENT_ADDRESS.clone(), multisig_address.clone())?;
    let links = hdk::get_links(
        &multisig_address, 
        LinkMatch::Exactly("multisig->transactions"), 
        LinkMatch::Any
    )?;
    Ok(links.addresses())
}

pub fn member_list(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
    member::get_member(AGENT_ADDRESS.clone(), multisig_address)?;
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