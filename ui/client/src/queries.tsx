import gql from 'graphql-tag';

export const GET_MY_ADDRESS_AND_MEMBERSHIP = gql`
    query AppData {
        myAddress 
        isMember
        dnaAddress
    }
`;

export const GET_MEMBERS = gql`
    query Members {
        members
    }
`