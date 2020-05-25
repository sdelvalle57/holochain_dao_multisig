extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;

use holochain_json_api::{ json::JsonString, error::JsonError };
use holochain_json_derive::{ DefaultJson };
use hdk::holochain_persistence_api::cas::content::Address;


/** This is used in the transaction struct **/
#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub enum LinkAction {
    ADD,
    REMOVE
}

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct LinkData {
    pub action: LinkAction,
    pub base: Option<Address>,
    pub target: Option<Address>,
    pub link_type: String,
    pub link_tag: Option<String>
}

impl LinkData {
    pub fn new(
        action: LinkAction,
        base: Option<Address>, 
        target: Option<Address>, 
        link_type: String, 
        link_tag: Option<String>
    ) -> Self {
        LinkData {
            action,
            base,
            target,
            link_type,
            link_tag
        }
    }
}

#[derive(Serialize, Deserialize, DefaultJson, Clone, Debug)]
pub enum EntryAction {
    UPDATE(Address),
    REMOVE(Address),
    COMMIT
}

/*************************************/

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct Person {
    pub name: String,
    pub address: Address
}