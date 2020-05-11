
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'react-emotion';

import {typeDefs} from './resolvers';

import Pages from './pages';
import injectStyles from './styles';
import { GET_HARDCODED_MEMBERS, GET_MY_ADDRESS, IS_HARDCODED_MEMBER, GET_MASTER_MULTISIG_ADDRESS } from './queries';
import { Loading, Error } from './components';
import { AppData } from './__generated__/AppData';
import { MasterMultisigAddress } from './__generated__/MasterMultisigAddress';


const cache = new InMemoryCache();
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT ? process.env.REACT_APP_SERVER_PORT : 4000;
console.log(SERVER_PORT, process.env.REACT_APP_SERVER_PORT, process.env.PORT)
const link = new HttpLink({
  uri: `http://localhost:${SERVER_PORT}/graphql`
});

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  link,
  typeDefs
});

const data = {
  multisigCreated: null
}

cache.writeData({
    data
});

function RenderPage() {
  const isHardcodedMember = useQuery(IS_HARDCODED_MEMBER);
  const multisigAddress = useQuery<MasterMultisigAddress>(GET_MASTER_MULTISIG_ADDRESS);

  if (isHardcodedMember.loading ) return <Loading />;
  if (isHardcodedMember.error) return <Error error={isHardcodedMember.error} />;

  if(multisigAddress.error) {
    for(let j = 0; j < multisigAddress.error.graphQLErrors.length; j++) {
      const err = multisigAddress.error.graphQLErrors[j];
      if(err.extensions?.exception.error === "Multisig has not been started or user is not Member") {
        if(isHardcodedMember.data) {
          //TODO: show start buttn
        } else {
          //TODO: show hasnt started 
        }
      }
    }
  }
  
  return  <Pages />  
}

const Global = styled('div')({
  fontSize: '12px'
})


injectStyles();
ReactDOM.render(
    <ApolloProvider client={client}>    
      <Global>
        <RenderPage />
      </Global>
    </ApolloProvider>,   
    document.getElementById('root')
);



