

use hdk::error::{ZomeApiError, ZomeApiResult};

use std::convert::{ TryInto, TryFrom };
use hdk::prelude::*;
use hdk::holochain_json_api::{error::JsonError, json::JsonString};
use serde::{de::DeserializeOwned};

pub use structures::{
    LinkData,
    EntryAction
};


#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
pub struct JSONRPC {
    pub title: String,
    pub description: String,
    pub entry_data: Entry,
    pub entry_action: EntryAction,
    pub entry_links: Option<Vec<LinkData>>
}

impl JSONRPC{
    pub fn new(title: String, description: String, entry_data: Entry, entry_action: EntryAction, entry_links: Option<Vec<LinkData>>) -> Self {
        JSONRPC {
            title,
            description,
            entry_data,
            entry_action,
            entry_links
        }
    }
}

pub fn decode_zome_call<R>(rpc_response: Result<JsonString, ZomeApiError>) -> ZomeApiResult<R> where R: TryFrom<JsonString> + Into<JsonString> + DeserializeOwned {
    if let Err(bad_call) = rpc_response {
        return Err(ZomeApiError::Internal(bad_call.to_string()));
    }
    let strng = rpc_response.unwrap();
    let decoded: Result<Result<R, ZomeApiError>, JsonError> = strng.try_into();
    match decoded {
        Ok(Ok(response_data)) => Ok(response_data),
        Ok(Err(response_err)) => Err(ZomeApiError::Internal(String::from(response_err))),
        Err(decoding_err) => Err(ZomeApiError::Internal(String::from(decoding_err))),
    }
}

pub fn tx_to_json(title: String, description: String, entry_data: Entry, entry_action: EntryAction, entry_links: Option<Vec<LinkData>>) -> ZomeApiResult<JsonString> {
    let json_rpc = JSONRPC::new(title, description, entry_data, entry_action, entry_links);
    Ok(json_rpc.into())
}