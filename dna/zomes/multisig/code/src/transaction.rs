/************************ Import Required Libraries */
use hdk::{
    entry_definition::ValidatingEntryType,
    error::{ZomeApiError, ZomeApiResult},
    AGENT_ADDRESS, DNA_ADDRESS, PUBLIC_TOKEN,
};

use hdk::holochain_core_types::dna::entry_types::Sharing;
use hdk::holochain_core_types::{entry::Entry, validation::EntryValidationData, validation::LinkValidationData};
use holochain_wasm_utils::api_serialization::{
    get_entry::{GetEntryOptions, GetEntryResult},
    get_links::GetLinksOptions,
};

use hdk::holochain_json_api::{error::JsonError, json::JsonString};
use hdk::holochain_persistence_api::cas::content::Address;
use hdk::prelude::AddressableContent;
use hdk::prelude::LinkMatch;
use hdk::ValidationData;
use std::convert::TryFrom;
use serde_json::json;

use crate::{
    multisig
};
/******************************************* */

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Transaction {
    title: String,
    description: String,
    required: u64,
    signed: Vec<Address>,
    creator: Address,
    executed: bool,
    data: Entry
}

impl Transaction{
    pub fn new(title: String, description: String, required: u64, data: Entry) -> Self {
        Transaction {
            title,
            description,
            required,
            signed: vec![AGENT_ADDRESS.clone()],
            creator: AGENT_ADDRESS.clone(),
            executed: false,
            data
        }
    }

    pub fn get(address: Address) -> ZomeApiResult<Self> {
        hdk::utils::get_as_type(address.to_string().into())
    }

    pub fn entry(&self) -> Entry {
        Entry::App("transaction".into(), self.into())
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
                    //TODO: validate agent is member
                    Ok(())
                    //return Err(String::from("Only the owner can create their multisigs"));
                },
                EntryValidationData::Modify { .. } => {
                    //TODO: validate agent is member
                    Ok(())
                    //return Err(String::from("Cannot modify"));
                },
                EntryValidationData::Delete {.. } => {
                     //TODO: validate agent is member and transaction has just one signature, and signature must be agent
                    return Err(String::from("Cannot delete"));
                }
            }
        },//TODO: link member-> transactions
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
    let new_tx = Transaction::new(title, description, 1, entry);
    let new_tx_entry = new_tx.entry();
    let new_tx_address = hdk::commit_entry(&new_tx_entry)?;
    let _multisig_addresses = multisig::get_multisig_address()?;
    // let _multisig_address =  &multisig_addresses[0];
    // hdk::link_entries(&AGENT_ADDRESS, &new_tx_address, "member->transactions", "")?;
    // hdk::link_entries(&multisig_address, &new_tx_address, "multisig->transactions", "")?;
    //TODO: check if the transaction can be executed (if requried === signatures)
    Ok(new_tx_address)
}

pub fn list() -> ZomeApiResult<Vec<Transaction>> {
    let multisig_address = multisig::get_multisig_address()?;
    let mut transactions: Vec<Transaction> = Vec::default();
    let links = hdk::get_links(
        &multisig_address, 
        LinkMatch::Exactly("multisig->transactions"), 
        LinkMatch::Any
    )?
    .addresses();
    for tx_address in links {
        let transaction: Transaction = hdk::utils::get_as_type(tx_address.clone())?;
        transactions.push(transaction)
    }
    Ok(transactions)
}

// pub fn change_requirement(new_requirement: u64) -> ZomeApiError<Address> {
    
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