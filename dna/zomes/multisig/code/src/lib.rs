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
use structures::{
    LinkData,
    EntryAction,
    Person
};

//use std::convert::TryInto;

/******************************** */

mod member;
mod transaction;
mod helpers;
mod multisig;


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
    fn multisig_anchor_entry_definition() -> ValidatingEntryType {
      multisig::anchor_entry_def()
    }

    #[entry_def]
    fn multisig_entry_definition() -> ValidatingEntryType {
      multisig::entry_def()
    }

    #[entry_def]
    fn transaction_entry_definition() -> ValidatingEntryType {
      transaction::entry_def()
    }

    #[entry_def]
    fn member_entry_definition() -> ValidatingEntryType {
      member::entry_def()
    }

    /*************** Helper Functions */
    #[zome_fn("hc_public")]
    fn get_my_address() -> ZomeApiResult<Address> {
        Ok(AGENT_ADDRESS.clone())
    }

    #[zome_fn("hc_public")]
    fn get_hardcoded_members() -> ZomeApiResult<Vec<Person>> {
        helpers::get_hardcoded_members()
    }

    #[zome_fn("hc_public")]
    fn get_dna_address() -> ZomeApiResult<Address> {
        Ok(DNA_ADDRESS.clone())
    }

    #[zome_fn("hc_public")]
    fn check_is_member() -> ZomeApiResult<bool> {
        helpers::check_is_member()
    }

    /*************** Setters */
    /*********** multisig.rs */
    #[zome_fn("hc_public")]
    fn start() -> ZomeApiResult<Address> {
        multisig::start_multisig()
    }

    #[zome_fn("hc_public")]
    fn change_requirement(new_requirement: u64, description: String, multisig_address: Address) -> ZomeApiResult<Address> {
        multisig::change_requirement(new_requirement, description, multisig_address)
    }

    #[zome_fn("hc_public")]
    fn create_for_organization(title: String, description: String, org_address: Address) -> ZomeApiResult<Address> {
        multisig::create_for_organization(title, description, org_address)
    }

    /*********** member.rs */
    #[zome_fn("hc_public")]
    fn add_member(name: String, description: String, address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
        member::add_member(name, description, address, multisig_address)
    }

    #[zome_fn("hc_public")]
    fn remove_member(description: String, entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
        member::remove_member(description, entry_address, multisig_address)
    }

    /*********** Transaction.rs */
    #[zome_fn("hc_public")]
    fn sign_transaction(entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
        transaction::sign_entry(entry_address, multisig_address)
    }

    #[zome_fn("hc_public")]
    fn execute_transaction(entry_address: Address, multisig_address: Address) -> ZomeApiResult<Address> {
        transaction::execute_transaction(entry_address, multisig_address)
    }

    #[zome_fn("hc_public")]
    fn submit_transaction(
        title: String, 
        description: String, 
        entry_data: Entry, 
        entry_action: EntryAction, 
        entry_links: Option<Vec<LinkData>>,
        multisig_address: Address
    ) -> ZomeApiResult<Address> {
        transaction::submit(title, description, entry_data, entry_action, entry_links, multisig_address)
    }
    /************ Getters */
    /*********** Transaction.rs */

    #[zome_fn("hc_public")]
    fn is_member(multisig_address: Address) -> ZomeApiResult<bool> {
        let member = member::get_member_by_address(AGENT_ADDRESS.clone(), multisig_address);
        match member {
            Ok(member) => {
                if member.active {
                    return Ok(true)
                }
                return Ok(false)
            },
            _ => return Ok(false)
        }
    }

    #[zome_fn("hc_public")]
    fn get_transaction(entry_address: Address) -> ZomeApiResult<transaction::Transaction> {
        transaction::get(entry_address)
    }

    #[zome_fn("hc_public")]
    fn get_transaction_list(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
        transaction::list(multisig_address)
    }

    #[zome_fn("hc_public")]
    fn get_transaction_member_list(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
        transaction::member_list(multisig_address)
    }

    /*********** member.rs */
    #[zome_fn("hc_public")]
    fn get_members(multisig_address: Address) -> ZomeApiResult<Vec<Address>> {
        member::get_members(multisig_address)
    }

    // Consider not making it available to public
    #[zome_fn("hc_public")]
    fn get_member(entry_address: Address, multisig_address: Address) -> ZomeApiResult<member::Member> {
        member::get_member(entry_address, multisig_address)
    }
    
    /*********** multisig.rs */
    #[zome_fn("hc_public")]
    fn get_multisig_address() -> ZomeApiResult<Address> {
        multisig::get_multisig_address()
    }

    #[zome_fn("hc_public")]
    fn get_multisig(multisig_address: Address) -> ZomeApiResult<multisig::Multisig> {
        multisig::get_multisig(multisig_address)
    }
}