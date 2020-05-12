import gql from 'graphql-tag';


/*****Multisig */
export const GET_MASTER_MULTISIG_ADDRESS= gql`
    query MasterMultisigAddress {
        getMultisigAddress {
            entry
        }
    }
`

export const GET_MULTISIG_MEMBERS = gql`
    query GetMultisigMembers($multisig_address: String!) {
        getMembers(multisig_address: $multisig_address) {
            member {
                name
                address
            }
        }
    }

`

export const GET_MULTISIG = gql`
    query GetMultisig($multisig_address: String!) {
        getMultisig(multisig_address: $multisig_address) {
            title
            description
            required
        }
    }

`

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


