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

use constants::{
    ADD_MEMBER,
    REMOVE_MEMBER
};

use structures::{
    Person,
    LinkData,
    EntryAction
};
/******************************************* */

use crate::{
    transaction,
    multisig
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Member {
    pub member: Person,
    pub multisig_address: Address,
    pub active: bool
}

impl Member {
    pub fn new(name: String, address: Address, multisig_address: Address) -> Self {
        Member {
            member: Person {
                name,
                address
            },
            multisig_address,
            active: true
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
                EntryValidationData::Delete { .. } => {
                    Err(String::from("Cannot remove member"))
                }
                _ => Ok(())
            }
        } 
    )
}

pub fn add_member(name: String, description: String, address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    let new_member = Member::new(name, address, multisig_address.clone());
    let new_member_entry = new_member.entry();
    let link_data = LinkData::new(
        Some(multisig_address.clone()), 
        None, "multisig->members".into(), 
        Some("".into())
    );
    transaction::submit(ADD_MEMBER.to_string(), description, new_member_entry, EntryAction::COMMIT, Some(vec![link_data]), multisig_address)
}

pub fn remove_member(description: String, entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    
    let mut member = get_member(entry_address.clone(), multisig_address.clone())?;
    if member.multisig_address != multisig_address.clone() {
        return Err(ZomeApiError::from(String::from("Member does not belong to Multisig")))
    } else if !member.active {
        return Err(ZomeApiError::from(String::from("Member already removed")))
    }
    member.active = false;
    let member_entry = member.entry();

    transaction::submit(
        REMOVE_MEMBER.to_string(), 
        description, 
        member_entry, 
        EntryAction::UPDATE(entry_address), 
        None, 
        multisig_address
    )
}

pub fn get_members(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
    let links = hdk::get_links(
        &multisig_address, 
        LinkMatch::Exactly("multisig->members"), 
        LinkMatch::Any
    )?;
    hdk::debug(format!("links_members {:?}", links))?;
    Ok(links.addresses())
}

pub fn get_member(entry_address: Address, multisig_address: Address) -> ZomeApiResult<Member> {
    let member: Member = hdk::utils::get_as_type(entry_address.clone())?;
    if member.multisig_address == multisig_address {
        return Ok(member);
    } 
    Err(ZomeApiError::from(String::from("Member not found")))
}

pub fn get_member_by_address(address: Address, multisig_address: Address) -> ZomeApiResult<Member> {
    let members = get_members(multisig_address.clone())?;
    for member_entry in members {
        let member = get_member(member_entry, multisig_address.clone())?;
        if member.member.address == address {
            return Ok(member)
        }
    }
    Err(ZomeApiError::from(String::from("Member not found")))
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