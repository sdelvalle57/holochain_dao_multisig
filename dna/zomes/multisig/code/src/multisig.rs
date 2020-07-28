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
    CHANGE_REQUIREMENT
};

use structures::{
    EntryAction
};
/******************************************* */

use crate::{
    helpers,
    member,
    transaction
};

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Multisig {
    pub title: String,
    pub description: String,
    pub required: u64,
    pub org_address: Option<Address>
}

impl Multisig{
    pub fn start_default() -> Self {
        Multisig {
            title: String::from("Master Multisig"),
            description: String::from("Master managed multisig"),
            required: 2,
            org_address: None
        }
    }
    
    pub fn new(title: String, description: String, org_address: Address) -> Self {
        Multisig {
            title,
            description,
            required: 1,
            org_address: Some(org_address)
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
                link_type: "multisig_list", //there should be just one
                validation_package:||{
                    hdk::ValidationPackageDefinition::Entry
                },
                validation:| validation_data: hdk::LinkValidationData|{
                    match validation_data {
                        LinkValidationData::LinkAdd { .. } => {
                            let multisig_address = get_multisig_address();
                            match multisig_address {
                                //checks if there is an multisig created already, 
                                // Ok(_) => if there is one returns error
                                // Err(_) => if there is none returns ok
                                Ok(_) => {
                                    return Err(String::from("Multisig already created"));
                                },
                                Err(_) => return Ok(())
                            }
                       },
                       LinkValidationData::LinkRemove { .. } => {
                            Err(String::from("Cannot remove link"))
                       }
                    }
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
        validation: | validation_data: hdk::EntryValidationData<Multisig> | {
            match validation_data{
                EntryValidationData::Create { entry, .. } => {
                    //Checks if the new multisig is the anchor or an org_multisig
                    match entry.org_address {
                        //is org_multisig
                        Some(address) => {
                            let org_multisig_created = get_org_multisig(address)?;
                            if org_multisig_created.len() > 0 {
                                return Err(String::from("Organization multisig already created")); 
                            }
                            return Ok(());
                        },
                        //is anchor_multisig
                        _ => {
                            let is_member = helpers::check_is_member()?;
                            if !is_member {
                                return Err(String::from("Only members can perform this operation"));
                            }
                            Ok(())
                        }
                    }
                },
                EntryValidationData::Modify { old_entry, new_entry, .. } => {
                    //Checks if the multisig is the anchor or an org_multisig
                    match old_entry.org_address {
                        //is org_multisig
                        Some(address) => {
                            let org_multisig_address = get_org_multisig(address.clone())?;
                            if org_multisig_address.len() > 0 {
                                let member = member::get_member_by_address(AGENT_ADDRESS.clone(), org_multisig_address[0].clone())?;
                                if !member.active {
                                    return Err(String::from("Member is not active"));
                                }
                                if Some(address) != new_entry.org_address {
                                    return Err(String::from("Cannot modify multisig org address"));
                                }
                                return Ok(());
                            }
                            return Err(String::from("Organization multisig not yet created")); 
                        },
                         //is anchor_multisig
                         _ => {
                            let multisig_address = get_multisig_address()?;
                            let member = member::get_member_by_address(AGENT_ADDRESS.clone(), multisig_address.clone())?;
                            if !member.active {
                                return Err(String::from("Member is not active"));
                            }
                            return Ok(());
                         }
                    }
                    
                },
                EntryValidationData::Delete { .. } => {
                    Err(String::from("Cannot delete multisig"))
                }
            }
        },
        links: [
            to!(
                "transaction",
                link_type: "multisig->transactions",
                validation_package:|| {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: | validation_data: hdk::LinkValidationData | {
                    match validation_data {
                        LinkValidationData::LinkAdd { link, .. } => {
                            let multisig_address = link.link.base();
                            let tx_address = link.link.target();
                            let links: Vec<Address> = transaction::list(multisig_address.clone())?;

                            if let Some(_) = links.iter().find(|&s| *s == tx_address.clone()) {
                                return Err(String::from("Transaction already created"));
                            } else {
                                return Ok(());
                            }

                          
                       },
                       LinkValidationData::LinkRemove { .. } => {
                            Err(String::from("Cannot remove link"))
                       }
                    }
                }
            ),
            to!(
                "member",
                link_type: "multisig->members",
                validation_package:|| {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: | validation_data: hdk::LinkValidationData | {
                    match validation_data {
                       LinkValidationData::LinkRemove { link, .. } => {
                            let multisig_address = link.link.base();
                            let multisig = get_multisig(multisig_address.clone())?;
                            let links = hdk::get_links_count(
                                &multisig_address, 
                                LinkMatch::Exactly("multisig->members"), 
                                LinkMatch::Any
                            )?;
                            if multisig.required > (links.count as u64 - 1) {
                                return Err(String::from("Requirement exceeds number of members"));
                            }
                            Ok(())

                       },
                       _ => Ok(())
                    }
                }
            ),
            from!(
                "org_multisig",
                link_type: "organization->multisig",
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


pub fn start_multisig() -> ZomeApiResult<Address> {
    let anchor_entry = anchor_entry();
    let anchor_address = hdk::commit_entry(&anchor_entry)?; // if Anchor exist, it returns the commited one.

    let default_multisig = Multisig::start_default();

    let multisig_entry = default_multisig.entry();
    let multisig_address = hdk::commit_entry(&multisig_entry)?; 

    let hardcoded_members = helpers::get_hardcoded_members()?;
    for person in hardcoded_members {
        let member = member::Member::new(person.name, person.address, multisig_address.clone());
        let member_entry = member.entry();
        let member_address = hdk::commit_entry(&member_entry)?;
        hdk::link_entries(&multisig_address, &member_address, "multisig->members", "")?; 
    }

    hdk::link_entries(&anchor_address, &multisig_address, "multisig_list", "")?; 

    Ok(multisig_address)
}

pub fn create_for_organization(title: String, description: String, org_address: Address) -> ZomeApiResult<Address> {
    let multisig = Multisig::new(title, description, org_address.clone());
    let multisig_entry = multisig.entry();
    let multisig_address = hdk::commit_entry(&multisig_entry)?;
    hdk::link_entries(&org_address, &multisig_address, "organization->multisig", "")?; 
    Ok(multisig_address)
}

pub fn change_requirement(new_requirement: u64, description: String, multisig_address: Address) -> ZomeApiResult<Address> {
    let mut multisig = get_multisig(multisig_address.clone()).clone()?;
    multisig.required = new_requirement;
    let new_entry = multisig.entry();
    transaction::submit(
        CHANGE_REQUIREMENT.to_string(), 
        description,  
        new_entry, 
        structures::EntryAction::UPDATE(multisig_address.clone()), 
        None, 
        multisig_address.clone()
    )
}

pub fn anchor_entry() -> Entry {
    Entry::App("anchor".into(), "multisig".into())
}

pub fn anchor_address() -> ZomeApiResult<Address> {
    hdk::entry_address(&anchor_entry())
}

pub fn get_multisig_address() -> ZomeApiResult<Address> {
    let links = hdk::get_links(
        &anchor_address()?, 
        LinkMatch::Exactly("multisig_list"), 
        LinkMatch::Any
    )?;
    if &links.addresses().len() > &usize::min_value() {
        let link = &links.links()[0];
        return Ok(link.address.clone());
    }
    Err(ZomeApiError::from(String::from("Multisig has not been started or user is not Member")))
}

pub fn get_multisig(multisig_address: Address) -> ZomeApiResult<Multisig> {
    let multisig: Multisig = hdk::utils::get_as_type(multisig_address.clone())?;
    Ok(multisig)
}

pub fn get_org_multisig(org_address: Address) -> ZomeApiResult<Vec<Address>> {
    let links = hdk::get_links(
        &org_address, 
        LinkMatch::Exactly("organization->multisig"), 
        LinkMatch::Any
    )?;
    return Ok(links.addresses());
}

