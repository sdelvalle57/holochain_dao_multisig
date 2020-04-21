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
    transaction,
    multisig,
    structures
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
            address
        }
    }

    pub fn entry(&self) -> Entry {
        Entry::App("member".into(), self.into())
    }
}

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name:"member",
        description: "member entry def",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | validation_data: hdk::EntryValidationData<Member> | {
            match validation_data {
                EntryValidationData::Create { .. } => {
                    Ok(())
                },
                EntryValidationData::Modify { .. } => {
                    Ok(())
                },
                EntryValidationData::Delete { .. } => {
                    Ok(())
                }
            }
        } 
    )
}

pub fn add_member(name: String, description: String, address: Address) -> ZomeApiResult<Address> {
    let new_member = Member::new(name, address);
    let new_member_entry = new_member.entry();
    let multisig_address = multisig::get_multisig_address()?;
    let link_data = structures::LinkData::new(Some(multisig_address), None, "multisig->members".into(), None);
    transaction::submit(ADD_MEMBER.to_string(), description, new_member_entry, Some(link_data))
}

pub fn get_members(multisig_address: Address) -> ZomeApiResult<Vec<Member>> {
    let links = hdk::get_links(
        &multisig_address, 
        LinkMatch::Exactly("multisig->members"), 
        LinkMatch::Any
    )?;
    hdk::debug(format!("links_members {:?}", links))?;

    let mut members: Vec<Member> = Vec::default();
    for add in links.addresses() {
        let member: Member = hdk::utils::get_as_type(add.clone())?;
        members.push(member);
    }
    Ok(members)
}

pub fn get_member(address: Address) -> ZomeApiResult<Member> {
    let multisig_address = multisig::get_multisig_address()?;
    let members = get_members(multisig_address)?;

    for member in members {
        if member.address == address {
            return Ok(member)
        }
    }
    Err(ZomeApiError::from(String::from("Member not found")))
}

pub fn get_member_by_entry(entry_address: Address) -> ZomeApiResult<Member> {
    let member: Member = hdk::utils::get_as_type(entry_address.clone())?;
    Ok(member)
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