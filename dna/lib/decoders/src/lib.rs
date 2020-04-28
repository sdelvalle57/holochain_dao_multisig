

use hdk::error::{ZomeApiError, ZomeApiResult};

use std::convert::{ TryInto, TryFrom };
use hdk::holochain_json_api::{error::JsonError, json::JsonString};
use serde::{de::DeserializeOwned};

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