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
use hdk::{AGENT_ADDRESS, THIS_INSTANCE, DNA_ADDRESS};
use hdk_proc_macros::zome;

//use std::convert::TryInto;

/******************************** */

mod multisig;
mod transaction;
mod helpers;

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct MyEntry {
    content: String,
}

#[zome]
mod my_zome {

    #[init]
    fn init() {
        hdk::debug(format!("New message from: {:?}", DNA_ADDRESS.clone())).ok();
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    /*************** Multisig Entry Definitions */

    #[entry_def]
    fn multisig_entry_definition() -> ValidatingEntryType {
        multisig::entry_def()
    }

    /*************** Helper Functions */

    #[zome_fn("hc_public")]
    fn get_my_address() -> ZomeApiResult<Address> {
        Ok(AGENT_ADDRESS.clone())
    }

    #[zome_fn("hc_public")]
    fn get_dna_address() -> ZomeApiResult<Address> {
        Ok(DNA_ADDRESS.clone())
    }

    #[zome_fn("hc_public")]
    fn get_entry(address: Address) -> ZomeApiResult<Option<Entry>> {
        hdk::get_entry(&address)
    }

    #[zome_fn("hc_public")]
    fn is_member() -> ZomeApiResult<bool> {
        helpers::check_is_member()
    }

    #[zome_fn("hc_public")]
    fn get_members() -> ZomeApiResult<Vec<Address>> {
        helpers::get_members()
    }
    
    /*************** Multisig Functions Setters */

    #[zome_fn("hc_public")]
    fn create_multisig(title: String, description: String) -> ZomeApiResult<Address> {
        multisig::create(title, description)
    }

    /************ Multisig Functions Getters */

    #[zome_fn("hc_public")]
    fn get(address: Address) -> ZomeApiResult<multisig::Multisig> {
        multisig::get(address)
    }

    #[zome_fn("hc_public")]
    fn get_my_multisigs() -> ZomeApiResult<Vec<Address>> {
        multisig::get_my_multisigs()
    }

    

}
