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

mod members;
mod transaction;
mod helpers;
mod multisig;

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct MyEntry {
    content: String,
}

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
    fn transaction_entry_definition() -> ValidatingEntryType {
      transaction::entry_def()
    }

    #[entry_def]
    fn multisig_entry_definition() -> ValidatingEntryType {
      multisig::entry_def()
    }

    #[entry_def]
    fn multisig_anchor_entry_definition() -> ValidatingEntryType {
      multisig::anchor_entry_def()
    }

    /*************** Helper Functions */

    #[zome_fn("hc_public")]
    fn get_my_address() -> ZomeApiResult<Address> {
        Ok(AGENT_ADDRESS.clone())
    }

    #[zome_fn("hc_public")]
    fn get_entry(address: Address) -> ZomeApiResult<Option<Entry>> {
        hdk::get_entry(&address)
    }

    #[zome_fn("hc_public")]
    fn get_hardcoded_members() -> ZomeApiResult<Vec<Address>> {
        helpers::get_members()
    }

    /*************** Multisig Functions Setters */

    #[zome_fn("hc_public")]
    fn add_member(name: String, description: String, address: Address) -> ZomeApiResult<Address> {
        members::add_member(name, description, address)
    }

    /************ Multisig Functions Getters */

    #[zome_fn("hc_public")]
    fn get_transaction(address: Address) -> ZomeApiResult<transaction::Transaction> {
        transaction::Transaction::get(address)
    }

    #[zome_fn("hc_public")]
    fn get_members() -> ZomeApiResult<Vec<Address>> {
        multisig::get_members()
    }

    #[zome_fn("hc_public")]
    fn get_multisig() -> ZomeApiResult<Vec<Address>> {
        multisig::get_multisig()
        // let addresses = multisig::get_multisig()?;
        // let mut multisigs: Vec<multisig::Multisig> = Vec::default();
        // for address in addresses {
        //     let multisig_entry = multisig::Multisig::get(address)?;
        //     multisigs.push(multisig_entry);
        // }
        // Ok(multisigs)
    }

    #[zome_fn("hc_public")]
    fn start() -> ZomeApiResult<Address> {
        multisig::start_multisig()
    }

}