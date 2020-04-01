const { gql } = require('apollo-server');

const typeDefs = gql`
    
    type Query {
        myAddress: String,
        dnaAddress: String,
        members: [String]!,
        isMember: Boolean
    }

    type Mutation {
        createMultisig(title: String!, description: String!): CreateMultisigResponse!
    }

    type CreateMultisigResponse {
        entry: String
    }

    type Multisig {
        title: String!,
        description: String!,
        signatories: [String!]!,
        required: Int!,
        creator: String!,
        address: String
    }
`;


module.exports = typeDefs;