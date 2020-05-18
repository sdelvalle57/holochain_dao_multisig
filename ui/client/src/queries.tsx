import gql from 'graphql-tag';


/*****Multisig */
export const GET_MASTER_MULTISIG_ADDRESS= gql`
    query MasterMultisigAddress {
        getMultisigAddress {
            entry
        }
    }
`;

export const GET_MULTISIG_MEMBERS = gql`
    query GetMultisigMembers($multisig_address: String!) {
        getMembers(multisig_address: $multisig_address) {
            member {
                name
                address
            }
            multisig_address
        }
    }
`;

export const GET_MULTISIG = gql`
    query GetMultisig($multisig_address: String!) {
        getMultisig(multisig_address: $multisig_address) {
            title
            description
            required
        }
    }
`;

export const GET_TRANSACTIONS = gql`
    query GetTransactionList($multisig_address: String!) {
        getTransactionList(multisig_address: $multisig_address) 
    }
`;

export const GET_TRANSACTION = gql`
    query GetTransaction($entry_address: String!, $multisig_address: String!) {
        getTransaction(entry_address: $entry_address, multisig_address: $multisig_address) {
            title
            description
            required
            signed {
            member {
                member {
                name
                address
                }
            }
            }
            creator {
            member {
                name
                address
            }
            }
            executed
            entry_data {
            App
            }
            entry_action {
            COMMIT
            UPDATE
            }
            entry_links {
            base
            target
            link_type
            link_tag
            }
        }
    }
`;

/*****Helpers */
export const GET_APP_DATA = gql`
    query AppData {
        myAddress 
        getDnaAddress
    }
`;


export const GET_HARDCODED_MEMBERS = gql`
    query HardcodedMembers {
        getHardcodedMembers {
            member {
                name
                address
            }
        }
    }
`

export const IS_HARDCODED_MEMBER = gql`
    query IsHardcodedMember {
        isHardcodedMember
    }

`


