const { gql } = require('apollo-server');

const typeDefs = gql`
    
    type Query {
        #**** Helpers *****
        myAddress: String,
        getDnaAddress: String,
        getHardcodedMembers: [Member!]!,
        isHardcodedMember: Boolean!,

        #**** Multisig *****
        isMember(multisig_address: String!): Boolean!,
        getMembers(multisig_address: String!): [String!]!,
        getMultisigAddress: Entry!,
        getMultisig(multisig_address: String!): Multisig!,
        getTransaction(entry_address: String!): Transaction!,
        getTransactionList(multisig_address: String!): [String]!,
        getTransactionMemberList(multisig_address: String!): [String]!,

        #**** Organizations *****
        getOrganizations(multisig_address: String!): [String]!,
        getOrganization(address: String!): Organization!
        getMyOrganizations: [String]!
    }

    type Mutation {
        #******* Multisig *******
        start: Entry!,
        changeRequirement(new_requirement: Int!, description: String!, multisig_address: String!): Entry!,
        addMember(name: String!, description: String!, address: String!, multisig_address: String!): Entry!,
        removeMember(description: String!, address: String!, multisig_address: String!): Entry!,
        signTransaction(entry_address: String!, multisig_address: String!): Entry!,
        executeTransaction(entry_address: String!, multisig_address: String!): Entry!,
        
        #******* Organizations ******* 
        newOrganization(name: String!, description: String!, owner: String!, multisig_address: String!): String!,
        newMultisig(title: String!, description: String!, organization_address: String!): String!
    }

    #***************************************************************************************************
    #***************************************************************************************************
    #***************************************************************************************************

    type Organization {
        name: String!,
        description: String!,
        owner: String!,
        multisig_address: String!,
        active: Boolean!
    }

    type Multisig {
        title: String!,
        description: String!,
        required: Int!
    }

    type Person {
        name: String!,
        address: String!
    }

    type Member {
        member: Person!,
        multisig_address: String!,
        active: Boolean!
    }

    type LinkData {
        base: String,
        target: String,
        link_type: String!,
        link_tag: String
    }

    type Transaction {
        entry_address: String!,
        title: String!,
        description: String!,
        required: Int!,
        multisig_address: String!,
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
        UPDATE: String,
    }

    enum _EntryAction {
        COMMIT 
        UPDATE
        REMOVE
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