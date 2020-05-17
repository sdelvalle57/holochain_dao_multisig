import gql from 'graphql-tag';

export const START_MULTISIG = gql`
    mutation Start {
        start {
            entry
        }
    }
`;

export const ADD_MEMBER = gql`
    mutation AddMember($name: String!, $description: String!, $address: String!, $multisig_address: String!) {
        addMember(name: $name, description: $description, address: $address, multisig_address: $multisig_address) {
            entry
        }
    }

`

export const CREATE_MULTISIG = gql`
    mutation NewMultisig($title: String!, $description: String!, $organization_address: String!) {
        newMultisig(title: $title, description: $description, organization_address: $organization_address) 
    }
`