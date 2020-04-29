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
      getMultisig: async (_, { multisig_address }, { dataSources }) => {
        const res = await dataSources.multisigAPI.getMultisig(multisig_address);
        return handleResponse(res, "Cannot fetch Multisig")
      },
      getTransaction: async (_, { entry_address, multisig_address }, { dataSources }) => {
        const res = await dataSources.multisigAPI.getTransaction(entry_address, multisig_address);
        return handleResponse(res, "Cannot fetch Transaction")
      },
      getTransactionList: async (_, {multisig_address}, { dataSources }) => {
        const res = await dataSources.multisigAPI.getTransactionList(multisig_address);
        return handleResponse(res, "Cannot fetch Multisig")
      },
      getTransactionMemberList: async (_, {multisig_address}, { dataSources }) => {
        const res = await dataSources.multisigAPI.getTransactionMemberList(multisig_address);
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
        changeRequirement: async (_, {new_requirement, description, multisig_address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.changeRequirement(new_requirement, description, multisig_address)
          return handleResponse(res, "Unable to create Multisig")
        },
        addMember: async (_, {name, description, address, multisig_address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.addMember(name, description, address, multisig_address)
          return handleResponse(res, "Unable to create transaction")
        },
        signTransaction: async (_, {entry_address, multisig_address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.signTransaction(entry_address, multisig_address)
          return handleResponse(res, "Unable to create transaction")
        },
        executeTransaction: async (_, {entry_address, multisig_address}, { dataSources }) => {
          const res = await dataSources.multisigAPI.executeTransaction(entry_address, multisig_address)
          return handleResponse(res, "Unable to execute transaction")
        },

        //*********Organizations**********
        newOrganization: async (_, {name, description, owner}, { dataSources }) => {
          const res = await dataSources.organizationsAPI.newOrganization(name, description, owner)
          return handleResponse(res, "Unable to create Organization")
        },
        newMultisig: async (_, {title, description, organization_address}, { dataSources }) => {
          const res = await dataSources.organizationsAPI.newMultisig(title, description, organization_address)
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
