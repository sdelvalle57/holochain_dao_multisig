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

use structures::{
    Person,
    LinkData,
    EntryAction,
    LinkAction
};
/******************************************* */

use crate::{
    transaction,
    multisig
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Member {
    pub member: Person,
    pub multisig_address: Address
}

impl Member {
    pub fn new(name: String, address: Address, multisig_address: Address) -> Self {
        Member {
            member: Person {
                name,
                address,
            },
            multisig_address
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
                EntryValidationData::Delete { old_entry, .. } => {
                    let multisig_address = old_entry.multisig_address;
                    let multisig = multisig::get_multisig(multisig_address.clone())?;
                    let multisig_members = get_members(multisig_address.clone())?;
                    if multisig.required > (multisig_members.len() as u64) - 1 {
                        return Err(String::from("Requirement exceeds number of members"));
                    }
                    Ok(())
                },
                _ => {
                    return Err(String::from("Member operation not permitted"));
                }
            }
        } 
    )
}

pub fn add_member(name: String, description: String, address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    let new_member = Member::new(name, address, multisig_address.clone());
    let new_member_entry = new_member.entry();
    let link_data = LinkData::new(
        LinkAction::ADD,
        Some(multisig_address.clone()), 
        None, "multisig->members".into(), 
        None
    );
    transaction::submit(ADD_MEMBER.to_string(), description, new_member_entry, EntryAction::COMMIT, Some(vec![link_data]), multisig_address)
}

pub fn remove_member(description: String, address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    
    let member = get_member(address, multisig_address.clone())?;
    let member_entry = member.entry();
    let entry_address = hdk::entry_address(&member_entry)?;

    let link_data = LinkData::new(
        LinkAction::REMOVE,
        Some(multisig_address.clone()), 
        Some(entry_address.clone()), 
        "multisig->members".into(), 
        None
    );

    transaction::submit(
        ADD_MEMBER.to_string(), 
        description, 
        member_entry, 
        EntryAction::REMOVE(entry_address.clone()), 
        Some(vec![link_data]), 
        multisig_address
    )
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

pub fn get_member(address: Address, multisig_address: Address) -> ZomeApiResult<Member> {
    let members = get_members(multisig_address)?;

    for member in members {
        if member.member.address == address {
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