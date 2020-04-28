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
use serde_json::json;

use decoders::decode_zome_call;

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Organization {
    pub name: String,
    pub description: String,
    pub owner: Address,
    pub permissions: Vec<String>
}

impl Organization {
    pub fn new(name: String, description: String, owner: Address) -> Self {
        Organization {
            name,
            description,
            owner,
            permissions: Vec::default()
        }
    }

    pub fn get(address: Address) -> ZomeApiResult<Self> {
        hdk::utils::get_as_type(address.to_string().into())
    }

    pub fn entry(&self) -> Entry {
        Entry::App("organization".into(), self.into())
    }
}

//// Entry Definitions
pub fn anchor_entry_def() -> ValidatingEntryType {
    entry!(
        name: "anchor",
        description: "Anchor for organizations",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |_validation_data : hdk::EntryValidationData<String>| {
            Ok(())
        },
        links: [
            to!(
                "organization",
                link_type: "organizations_list",
                validation_package:|| {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation:| _validation_data: hdk::LinkValidationData | {
                    Ok(())
                }
            )
        ] 
    )
}

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name: "organization",
        description: "Organization entry def",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | _validation_data: hdk::EntryValidationData<Organization> | {
            Ok(())
        },
        links: [
            to!(
                "member",
                link_type: "organization->employees",
                validation_package: || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: | _validation_data: hdk::LinkValidationData | {
                    Ok(())
                }
            )
        ]
    )
}

pub fn new(name: String, description: String, owner: Address) -> ZomeApiResult<Address> {
    let organization = Organization::new(name, description, owner);
    let _organization_entry = organization.entry();
    //read_from_zome(hdk::THIS_INSTANCE, "multisig", Address::from(hdk::PUBLIC_TOKEN.to_string()), "get_multisig_address", JsonString::from("{}"))
    let rpc_response = hdk::call(hdk::THIS_INSTANCE, "multisig", Address::from(hdk::PUBLIC_TOKEN.to_string()), "get_multisig_address", JsonString::from("{}"));
    decode_zome_call(rpc_response)
    
}



/*
pub fn new(name: String, description: String, owner: Address) -> ZomeApiResult<Address> {
    let organization = Organization::new(name, description, owner);
    let _organization_entry = organization.entry();
    hdk::call(hdk::THIS_INSTANCE, "multisig", Address::from(hdk::PUBLIC_TOKEN.to_string()), "get_multisig_address", JsonString::from("{}"))?;
    
}
*/

