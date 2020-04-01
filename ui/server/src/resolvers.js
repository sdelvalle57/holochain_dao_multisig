const { ApolloError } = require('apollo-server')

module.exports = {
    Query: {
      myAddress: async (_, __, { dataSources }) => {
        const res = await dataSources.helpersAPI.getMyAddress()
        return handleResponse(res, "Cannot fetch user Address")
      },
      isMember: async (_, __, { dataSources }) => {
        const res = await dataSources.helpersAPI.isMember();
        return handleResponse(res, "Cannot check if member")
      },
      dnaAddress: async (_, __, { dataSources }) => {
        const res = await dataSources.helpersAPI.dnaAddress();
        return handleResponse(res, "Cannot fetch DNA address")
      },
      members: async (_, __, { dataSources }) => {
        const res = await dataSources.helpersAPI.members();
        return handleResponse(res, "Cannot fetch Members")
      },
      
      // getMyMultisigs: (_, __, { dataSources }) => dataSources.multisigAPI.getAll()
    },
    // Mutation: {
    //     createMultisig: async (_, {title, description}, { dataSources }) => {
    //       const res = await dataSources.multisigAPI.createMultisig(title, description)
    //       return handleResponse(res, "Unable to create Multisig")
    //     }
    // },
  };

  const handleResponse = (res, message) => {
    if(res.error) {
      throw new ApolloError(message, "HOLOCHAIN_ERROR", res)
    }
    return res;
  }
