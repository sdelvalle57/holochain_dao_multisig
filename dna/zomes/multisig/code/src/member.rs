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

use constants::{ADD_MEMBER};
/******************************************* */

use crate::{
    transaction
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Member {
    pub name: String,
    pub address: Address
}

impl Member {
    pub fn new(name: String, address: Address) -> Self {
        Member {
            name,
            address,
        }
    }

    pub fn entry(&self) -> Entry {
        Entry::App("members".into(), self.into())
    }
}

pub fn add_member(name: String, description: String, address: Address) -> ZomeApiResult<Address> {
    let new_member = Member::new(name, address);
    let new_member_entry = new_member.entry();
    transaction::submit(ADD_MEMBER.to_string(), description, new_member_entry)
}



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