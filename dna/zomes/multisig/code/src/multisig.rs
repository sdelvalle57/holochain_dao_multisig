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
    helpers
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Multisig {
    required: u64,
    members: Vec<Address>
}

impl Multisig{
    pub fn start_default() -> Self {
        Multisig {
            required: 1,
            members: Vec::default()
        }
    }

    pub fn get(address: Address) -> ZomeApiResult<Self> {
        hdk::utils::get_as_type(address.to_string().into())
    }

    pub fn entry(&self) -> Entry {
        Entry::App("multisig".into(), self.into())
    }
}

//// Entry Definitions
pub fn anchor_entry_def() -> ValidatingEntryType {
    entry!(
        name: "anchor",
        description: "Anchor to the multisig",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | _validation_data: hdk::EntryValidationData<String> | {
            Ok(())
        },
        links:[
            to!(
                "multisig",
                link_type: "multisig_list",
                validation_package:||{
                    hdk::ValidationPackageDefinition::Entry
                },
                validation:|_validation_data: hdk::LinkValidationData|{
                    Ok(())
                }
            )
        ]
    )
}

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name: "multisig",
        description: "multisig entry def",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | _validation_data: hdk::EntryValidationData<Multisig> | {
            Ok(())
        }
    )
}

pub fn anchor_entry() -> Entry {
    Entry::App("anchor".into(), "multisig".into())
}

pub fn anchor_address() -> ZomeApiResult<Address> {
    hdk::entry_address(&anchor_entry())
}


pub fn get_multisig() -> ZomeApiResult<Vec<Address>> {
    let links = hdk::get_links(
        &anchor_address()?, 
        LinkMatch::Exactly("multisig_list"), 
        LinkMatch::Any
    )?
    .addresses();
    Ok(links)
}

pub fn get_members() -> ZomeApiResult<Vec<Address>> {
    let links = hdk::get_links(
        &AGENT_ADDRESS, 
        LinkMatch::Exactly("multisig->members"), 
        LinkMatch::Any
    )?
    .addresses();
    Ok(links)
}

pub fn start_multisig() -> ZomeApiResult<Address> {
    let anchor_entry = anchor_entry();
    let anchor_address = hdk::commit_entry(&anchor_entry)?; // if Anchor exist, it returns the commited one.

    let mut default_multisig = Multisig::start_default();

    let hardcoded_members = helpers::get_members()?;
    for member in hardcoded_members {
        default_multisig.members.push(member);
    }

    let multisig_entry = default_multisig.entry();
    let multisig_address = hdk::commit_entry(&multisig_entry)?; //TODO: do validation if agent_address is in hardcoded members

    hdk::link_entries(&anchor_address, &multisig_address, "multisig_list", "")?; //TODO: do validation if link is not already added

    Ok(multisig_address)
  
}