const { gql } = require('apollo-server');

const typeDefs = gql`
    
    type Query {
        #**** Helpers *****
        myAddress: String,
        getHardcodedMembers: [Member!]!,

        #**** Multisig *****
        getMembers(multisig_address: String!): [Member!]!,
        getMultisigAddress: Entry!,
        getMultisig: Multisig!,
        getTransaction(entry_address: String!): Transaction!,
        getTransactionList: [String]!,
        getTransactionMemberList: [String]!,

        #**** Organizations *****
        getOrganizations: [String]!,
        getOrganization(address: String!): Organization!
        getMyOrganizations: [String]!
    }

    type Mutation {
        #******* Multisig *******
        start: Entry!,
        changeRequirement(new_requirement: Int!, description: String!): Entry!,
        addMember(name: String!, description: String!, address: String!): Entry!,
        signTransaction(entry_address: String!): Entry!,
        executeTransaction(entry_address: String!): Entry!,
        
        #******* Organizations ******* 
        newOrganization(name: String!, description: String!, owner: String!): String!,
        newMultisig: String!

    }

    #***************************************************************************************************
    #***************************************************************************************************
    #***************************************************************************************************

    type Organization {
        name: String!,
        description: String!,
        owner: String!,
        permissions: [String]!
    }

    type Multisig {
        required: Int!
    }

    type Person {
        name: String!,
        address: String!
    }

    type Member {
        member: Person!
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
        entry_data: AppEntry!,
        entry_action: EntryAction,
        entry_links: [LinkData],
        response_address: String
    }

    type EntryAction {
        COMMIT: String,
        UPDATE: String
    }

    enum _EntryAction {
        COMMIT 
        UPDATE
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


    
`;


module.exports = typeDefs;