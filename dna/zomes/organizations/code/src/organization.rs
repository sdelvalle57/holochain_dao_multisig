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

use decoders::{
    decode_zome_call,
    tx_to_json
};

use crate::{
    employee
};

use constants::{
    REMOVE_ORGANIZATION
};

pub use structures::{
    LinkData,
    EntryAction
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Organization {
    pub name: String,
    pub description: String,
    pub owner: Address,
    pub multisig_address: Address,
    pub active: bool
}

impl Organization {
    pub fn new(name: String, description: String, owner: Address, multisig_address: Address) -> Self {
        Organization {
            name,
            description,
            owner,
            multisig_address,
            active: true
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
            from!(
                "%agent_id",
                link_type: "owner->organizations",
                validation_package:|| {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation:| _validation_data: hdk::LinkValidationData | {
                    Ok(())
                }
            ),
            from!(
                "multisig",
                link_type: "multisig->organizations",
                validation_package:|| {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation:| _validation_data: hdk::LinkValidationData | {
                    Ok(())
                }
            ),
            to!(
                "employee",
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

pub fn new(name: String, description: String, owner: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    
    let organization = Organization::new(name, description, owner.clone(), multisig_address.clone());
    let organization_entry = organization.entry();

    let tx_title = String::from("Add new organization");
    let tx_description = String::from("New organization");
    let tx_entry_data = organization_entry;
    let tx_entry_action = EntryAction::COMMIT;
    let tx_link_data_msig = LinkData::new(
        Some(multisig_address.clone()), 
        None, 
        String::from("multisig->organizations"), 
        None
    );
    let tx_link_data_owner = LinkData::new(
        Some(owner), 
        None, 
        String::from("owner->organizations"), 
        None
    );
    let tx_entry_links = vec![tx_link_data_msig, tx_link_data_owner];
    let args = tx_to_json(tx_title, tx_description, tx_entry_data, tx_entry_action, Some(tx_entry_links), multisig_address)?;
    send_transaction(args)
}

pub fn remove(description: String, entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
    let mut organization: Organization = hdk::utils::get_as_type(entry_address.clone())?;
    if organization.multisig_address != multisig_address.clone() {
        return Err(ZomeApiError::from(String::from("Organization does not belong to Multisig")))
    } else if !organization.active {
        return Err(ZomeApiError::from(String::from("Organization already removed")))
    }
    organization.active = false;
    let organization_entry = organization.entry();

    let tx_title = String::from("Remove organization");
    let tx_entry_data = organization_entry;
    let tx_entry_action = EntryAction::UPDATE(entry_address.clone());

    let args = tx_to_json(tx_title, description, tx_entry_data, tx_entry_action, None, multisig_address)?;
    send_transaction(args)
}

fn send_transaction(args: JsonString) -> ZomeApiResult<Address> {
    let token_cap = Address::from(hdk::PUBLIC_TOKEN.to_string());
    let rpc_call_transaction = hdk::call(hdk::THIS_INSTANCE, "multisig", token_cap, "submit_transaction", args);
    let rpc_call_transaction_address: Address = decode_zome_call(rpc_call_transaction)?;
    Ok(rpc_call_transaction_address)
}

// TODO
// pub fn newSuborganization(name: String, description: String, owner: Address, parent: String) -> ZomeApiResult<Address> {

// }

pub fn new_multisig(title: String, description: String, org_address: Address) -> ZomeApiResult<Address> {
    let organization: Organization = hdk::utils::get_as_type(org_address.clone())?;

    let owner: employee::Employee = hdk::utils::get_as_type(organization.owner)?;

    if owner.person.address != AGENT_ADDRESS.clone() {
        return Err(ZomeApiError::from(String::from("Agent is not organization owner")));
    }

    #[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
    pub struct MSIG {
        pub title: String,
        pub description: String,
        pub org_address: Address
    }
    let to_send = MSIG { 
        title, 
        description, 
        org_address 
    };

    let token_cap = Address::from(hdk::PUBLIC_TOKEN.to_string());
    hdk::debug(format!("org_pub_token {:?}", token_cap.clone()))?;
    let rpc_call_new_msig = hdk::call(hdk::THIS_INSTANCE, "multisig", token_cap.clone(), "create_for_organization", to_send.into());
    let multisig_address: Address = decode_zome_call(rpc_call_new_msig.clone())?;
    Ok(multisig_address)
}


pub fn get_all(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
    let links = hdk::get_links(
        &multisig_address, 
        LinkMatch::Exactly("multisig->organizations"), 
        LinkMatch::Any
    )?;
    Ok(links.addresses())
} 

// TODO
// pub fn get_all_suborganizations(parent: Address) -> ZomeApiResult<Vec<Address>> {
// }

pub fn get(entry_address: Address) -> ZomeApiResult<Organization> {
    let organization: Organization = hdk::utils::get_as_type(entry_address.clone())?;
    Ok(organization)
} 

pub fn get_my_organizations() -> ZomeApiResult<Vec<Address>> {
    let links = hdk::get_links(
        &AGENT_ADDRESS, 
        LinkMatch::Exactly("owner->organizations"), 
        LinkMatch::Any
    )?;
    Ok(links.addresses())
}

