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
/******************************************* */

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Transaction {
    title: String,
    description: String,
    required: u64,
    signed: Vec<Address>,
    creator: Address,
    //TODO: figure out how to call functions of another DNA
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

// pub fn entry_def() -> ValidatingEntryType {
//     entry!(
//         name: "transaction",
//         description: "this is the transaction entry def",
//         sharing: Sharing::Public,
//         validation_package: || {
//             hdk::ValidationPackageDefinition::Entry
//         },
//         validation: | _validation_data: hdk::EntryValidationData<Transaction> | {
//             Ok(())
//             // match validation_data {
                
//                 // EntryValidationData::Create { entry, validation_data } => {
//                 //     if !validation_data.sources().contains(&entry.creator) {
//                 //         return Err(String::from("Only the owner can create their multisigs"));
//                 //     }
//                 //     //validate_multisig(&entry)
//                 // },
//                 // EntryValidationData::Modify { new_entry: _, old_entry: _, validation_data: _, .. } => {
//                 //     return Err(String::from("Cannot modify"));
//                 // },
//                 // EntryValidationData::Delete {old_entry: _, validation_data: _, .. } => {
//                 //     return Err(String::from("Cannot delete"));
//                 // }
//             // }
//         },
//         links: [
            
//         ]
//     )
// }

pub(crate) fn submit(title: String, description: String, entry: Entry) -> ZomeApiResult<Address> {
    let new_tx = Transaction::new(title, description, 1, entry);
    let new_tx_entry = new_tx.entry();
    let new_tx_address = hdk::commit_entry(&new_tx_entry)?;
    Ok(new_tx_address)
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