const { gql } = require('apollo-server');

const typeDefs = gql`
    
    type Query {
        myAddress: String,
        getHardcodedMembers: [Member!]!,
        getMembers(multisig_address: String!): [Member!]!,
        getMultisigAddress: Entry!,
        getMultisig: Multisig!,
        getTransaction(entry_address: String!): Transaction!,
        getTransactionList: [String]!,
        getTransactionMemberList: [String]!
    }

    type Multisig {
        required: Int!
    }

    type Member {
        name: String!,
        address: String!
    }

    type LinkData {
        base: String,
        target: String,
        link_type: String!,
        link_tag: String
    }

    type Transaction {
        title: String!,
        description: String!,
        required: Int!,
        signed: [VerifiedMember!],
        creator: Member!,
        executed: Boolean!,
        data: AppEntry!,
        link_data: LinkData,
        entry_address: String
    }

    type VerifiedMember {
        member: Member!,
        signature:String
    }

    type Entry {
        entry: String!
    }

    type AppEntry {
        App: [String!]!
    }

    



    type Mutation {
        start: Entry!,
        addMember(name: String!, description: String!, address: String!): Entry!,
        signTransaction(entry_address: String!): Entry!,
        executeTransaction(entry_address: String!): Entry!,
    }

    # type CreateMultisigResponse {
    #     entry: String
    # }
`;


module.exports = typeDefs;