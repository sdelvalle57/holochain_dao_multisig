const { ApolloError } = require('apollo-server')

module.exports = {
    Query: {
      //*********Helpers**********
      myAddress: async (_, __, { dataSources }) => {
        const res = await dataSources.helpersAPI.getMyAddress()
        return handleResponse(res, "Cannot fetch user Address")
      },
      getHardcodedMembers: async (_, __, { dataSources }) => {
        const res = await dataSources.helpersAPI.getHardcodedMembers();
        return handleResponse(res, "Cant fetch members")
      },

      //*********Multisig**********
      getMembers: async (_, { multisig_address }, { dataSources }) => {
        const res = await dataSources.multisigAPI.getMembers(multisig_address);
        return handleResponse(res, "Cannot fetch members")
      },
      getMultisigAddress: async (_, __, { dataSources }) => {
        const res = await dataSources.multisigAPI.getMultisigAddress();
        return handleResponse(res, "Cannot fetch Multisig")
      },
      getMultisig: async (_, __, { dataSources }) => {
        const res = await dataSources.multisigAPI.getMultisig();
        return handleResponse(res, "Cannot fetch Multisig")
      },
      getTransaction: async (_, { entry_address }, { dataSources }) => {
        const res = await dataSources.multisigAPI.getTransaction(entry_address);
        return handleResponse(res, "Cannot fetch Transaction")
      },
      getTransactionList: async (_, __, { dataSources }) => {
        const res = await dataSources.multisigAPI.getTransactionList();
        return handleResponse(res, "Cannot fetch Multisig")
      },
      getTransactionMemberList: async (_, __, { dataSources }) => {
        const res = await dataSources.multisigAPI.getTransactionMemberList();
        return handleResponse(res, "Cannot fetch Multisig")
      },

      //*********Organizations**********
      getOrganizations: async (_, __, { dataSources }) => {
        const res = await dataSources.organizationsAPI.getOrganizations();
        return handleResponse(res, "Cannot fetch Organizations")
      },
      getOrganization: async (_, {address}, { dataSources }) => {
        const res = await dataSources.organizationsAPI.getOrganization(address);
        return handleResponse(res, "Cannot fetch Organization")
      },
      getMyOrganizations: async (_, __, { dataSources }) => {
        const res = await dataSources.organizationsAPI.getMyOrganizations();
        return handleResponse(res, "Cannot fetch my Organizations")
      },
    },
    Mutation: {
        //*********Multisig**********
        start: async (_, __, { dataSources }) => {
          const res = await dataSources.multisigAPI.start()
          return handleResponse(res, "Unable to create Multisig")
        },
        changeRequirement: async (_, {new_requirement, description}, { dataSources }) => {
          const res = await dataSources.multisigAPI.changeRequirement(new_requirement, description)
          return handleResponse(res, "Unable to create Multisig")
        },
        addMember: async (_, {name, description, address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.addMember(name, description, address)
          return handleResponse(res, "Unable to create transaction")
        },
        signTransaction: async (_, {entry_address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.signTransaction(entry_address)
          return handleResponse(res, "Unable to create transaction")
        },
        executeTransaction: async (_, {entry_address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.executeTransaction(entry_address)
          return handleResponse(res, "Unable to execute transaction")
        },

        //*********Organizations**********
        newOrganization: async (_, {name, description, owner}, { dataSources }) => {
          const res = await dataSources.organizationsAPI.newOrganization(name, description, owner)
          return handleResponse(res, "Unable to create Organization")
        },
        newMultisig: async (_, __, { dataSources }) => {
          const res = await dataSources.organizationsAPI.newMultisig()
          return handleResponse(res, "Unable to create Organization")
        },
    },
  };

  const handleResponse = (res, message) => {
    if(res.error) {
      throw new ApolloError(message, "HOLOCHAIN_ERROR", res)
    }
    return res;
  }
