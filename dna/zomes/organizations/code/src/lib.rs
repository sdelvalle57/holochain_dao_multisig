/***************** Required Library */
#![feature(vec_remove_item)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![feature(proc_macro_hygiene)]
#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate holochain_json_derive;

use hdk::prelude::*;

//use hdk::holochain_json_api::json::JsonString;

use hdk::holochain_json_api::{error::JsonError, json::JsonString};
use hdk::holochain_persistence_api::cas::content::Address;
use hdk::{AGENT_ADDRESS, THIS_INSTANCE};
use hdk_proc_macros::zome;

//use std::convert::TryInto;

/******************************** */

mod organization;
mod employee;

#[zome]
mod my_zome {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    /*************** Entry Definitions */
    #[entry_def]
    fn entry_def() -> ValidatingEntryType {
      organization::entry_def()
    }

    /*************** Setter Functions */
    #[zome_fn("hc_public")]
    fn new(name: String, description: String, owner: Address, multisig_address: Address) -> ZomeApiResult<Address> {
      organization::new(name, description, owner, multisig_address)
    }

    #[zome_fn("hc_public")]
    fn create_multisig(title: String, description: String, organization_address: Address) -> ZomeApiResult<Address> {
      organization::new_multisig(title, description, organization_address)
    }

    /*************** Getter Functions */
    #[zome_fn("hc_public")]
    fn get_all() -> ZomeApiResult<Vec<Address>> {
      organization::get_all()
    }

    #[zome_fn("hc_public")]
    fn get(address: Address) -> ZomeApiResult<organization::Organization> {
      organization::get(address)
    } 

    #[zome_fn("hc_public")]
    fn get_my_organizations() -> ZomeApiResult<Vec<Address>> {
      organization::get_my_organizations()
    }
}