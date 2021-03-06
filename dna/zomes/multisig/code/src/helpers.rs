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
    member::Member
};

pub use structures::{
    Person
};
/******************************************* */

fn get_valid_members() -> ZomeApiResult<Vec<Person>> {
    let valid_members_json = hdk::property("valid_members")?;
    let persons: Result<Vec<Person>, _> = serde_json::from_str(&valid_members_json.to_string());
    
    match persons {
        Ok(persons) => {
            Ok(persons)
        },
        Err(_) => Err(ZomeApiError::from(String::from("Could not load members")))
    }
}

pub fn get_hardcoded_members() -> ZomeApiResult<Vec<Person>> {
    let valid_members = get_valid_members()?;
    for m in &valid_members {
        if m.address == AGENT_ADDRESS.clone() {
            return Ok(valid_members.clone());
        }
    }
   
    return Err(ZomeApiError::from(String::from("User is not member")))
}

pub fn check_is_member() -> ZomeApiResult<bool> {
    let valid_members = get_valid_members()?;
    for m in valid_members {
        if m.address == AGENT_ADDRESS.clone() {
            return Ok(true);
        }
    }
    return Err(ZomeApiError::from(String::from("User is not member")))
    
}