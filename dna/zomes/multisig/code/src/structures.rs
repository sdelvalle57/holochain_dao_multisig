

use hdk::holochain_persistence_api::cas::content::Address;

use hdk::holochain_json_api::{error::JsonError, json::JsonString};


#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct LinkData {
    pub base: Option<Address>,
    pub target: Option<Address>,
    pub link_type: String,
    pub link_tag: Option<String>
}

impl LinkData {
    pub fn new(base: Option<Address>, target: Option<Address>, link_type: String, link_tag: Option<String>) -> Self {
        LinkData {
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
    COMMIT
}