const { gql } = require('apollo-server');

const typeDefs = gql`
    
    type Query {
        myAddress: String,
        dnaAddress: String,
        members: [String]!,
        isMember: Boolean
    }

    type Multisig {
        required: Int!,
        members: [Member]!,
    }

    type Member {
        name: String!,
        address: String!
    }

    type Transaction {
        title: String!,
        description: String!,
        required: Int!,
        signed: [VerifiedMember!],
        creator: Member!,
        executed: Boolean!,
        data: Entry!
    }

    type VerifiedMember {
        member: Member!,
        signature:String
    }

    type Entry {
        App: [String | Member]!
    }



    # data: {
    #     App: [
    #       'member',
    #       '{"name":"Bob","address":"HcScj5GbxXdTq69sfnz3jcA4u5f35zftsuu5Eb3dBxHjgd9byUUW6JmN3Bvzqqr"}',
    #       [length]: 2
    #     ]
    #   }




    type Mutation {
        createMultisig(title: String!, description: String!): CreateMultisigResponse!
    }

    type CreateMultisigResponse {
        entry: String
    }
`;


module.exports = typeDefs;