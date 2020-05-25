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
`;

export const REMOVE_MEMBER = gql`
    mutation RemoveMember($description: String!, $address: String!, $multisig_address: String!) {
        removeMember(description: $description, address: $address, multisig_address: $multisig_address) {
            entry
        }
    }
`;

export const CHANGE_REQUIREMENT = gql`
    mutation ChangeRequirement($multisig_address: String!, $new_requirement: Int!, $description: String!) {
        changeRequirement(multisig_address: $multisig_address, new_requirement: $new_requirement, description: $description) {
            entry
        }
    }
`;


export const NEW_ORGANIZATION = gql`
    mutation NewOrganization($name: String!, $description: String!, $owner: String!, $multisig_address: String!) {
        newOrganization(name: $name, description: $description, owner: $owner, multisig_address: $multisig_address) 
    }
`;



// not yet implemented
export const CREATE_MULTISIG = gql`
    mutation NewMultisig($title: String!, $description: String!, $organization_address: String!) {
        newMultisig(title: $title, description: $description, organization_address: $organization_address) 
    }
`;