import gql from 'graphql-tag';

export const CREATE_MULTISIG = gql`
    mutation NewMultisig($title: String!, $description: String!, $organization_address: String!) {
        newMultisig(title: $title, description: $description, organization_address: $organization_address) 
    }
`;