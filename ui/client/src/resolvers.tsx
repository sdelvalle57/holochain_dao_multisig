import gql from 'graphql-tag';
import { Resolvers } from 'apollo-client';
import { ApolloCache } from 'apollo-cache';
import { AppData } from './__generated__/AppData';
import { GET_APP_DATA, GET_MASTER_MULTISIG_ADDRESS } from './queries';
// import { ApolloCache } from 'apollo-cache';
// import { Resolvers } from 'apollo-client'

export const typeDefs = gql`
  extend type Query {
    multisigAddress: string
    appData: AppData
  }

  extend type GetAppData {
    getAppData: AppData
  }

  extend type SetAppData {
    setAppData(appData: AppData)
  }
`

type ResolverFn = (
  parent: any,
  args: any,
  { cache } : { cache: ApolloCache<any> }
) => any;

interface ResolverMap {
  [field: string]: ResolverFn;
}

interface AppResolvers extends Resolvers {
  GetAppData: ResolverMap;
  SetAppData: ResolverMap
}

export const resolvers: AppResolvers = {
  GetMultisigAddress: {
    getMultisigAddress: (_, __, { cache }): string | null => {
      const queryResult = cache.readQuery<string>({ query: GET_MASTER_MULTISIG_ADDRESS});
      return queryResult;
    }
  }
  GetAppData: {
    getAppData: (__, _, { cache }): AppData | null => {
      const queryResult = cache.readQuery<AppData>({ query: GET_APP_DATA });
      return queryResult;
    }
  },
  SetAppData: {
    setAppData: (_, { appData }: { appData: AppData }, { cache }) => {
      cache.writeQuery({ query: GET_APP_DATA, data: {appData} });
    },
  }

// };


/*
let multisigAddress: string | undefined = undefined;
let notStarted = false;
let appData: AppData | ApolloError | undefined = undefined;

const m = client.query<MasterMultisigAddress>({
  query: GET_MASTER_MULTISIG_ADDRESS
})
m.then(res => {
  if(res.data.getMultisigAddress.entry) {
    multisigAddress = res.data.getMultisigAddress.entry;
  }
})
m.catch((error: ApolloError) => {
  for(let j = 0; j < error.graphQLErrors.length; j++) {
    const err = error.graphQLErrors[j];
    if(err.extensions?.exception.error === "Multisig has not been started or user is not Member") {
      notStarted = true;
    }
  }
})

const a = client.query<AppData>({
  query: GET_APP_DATA
})
a.then(res => {
  appData = res.data;
})
a.catch((error: ApolloError) => {
  appData = error;
})


*/