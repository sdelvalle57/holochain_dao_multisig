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

pub use structures::{
    Person,
};

use crate::{
    organization
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Employee {
    pub person: Person,
    pub organization: Address,
    pub position: Vec<String>,
    pub salary: Option<u64>,
    pub currency: String
}

impl Employee {
    pub fn new(
        person: Person,
        organization: Address,
        position: Vec<String>, 
        salary: Option<u64>, 
        currency: String, 
    ) -> Self {
        Employee {
            person,
            organization,
            position,
            salary,
            currency
        }
    }

    pub fn get(address: Address) -> ZomeApiResult<Self> {
        hdk::utils::get_as_type(address.to_string().into())
    }

    pub fn entry(&self) -> Entry {
        Entry::App("employee".into(), self.into())
    }
}

//// Entry Definitions

pub fn entry_def() -> ValidatingEntryType {
    entry!(
        name: "employee",
        description: "Employee entry def",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | _validation_data: hdk::EntryValidationData<Employee> | {
            Ok(())
        },
        links: [
            to!(
                "organization",
                link_type: "employee->organizations",
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