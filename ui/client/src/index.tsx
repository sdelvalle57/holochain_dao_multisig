import React, { Fragment } from 'react';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';
import ReactDOM from 'react-dom';

import injectStyles from './styles';
import { PageContainer } from './components';
import { Router } from '@reach/router';

import { Selector, PendingTxs } from './pages';

/*Start initialization */
const cache = new InMemoryCache();
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT ? process.env.REACT_APP_SERVER_PORT : 4000;
const link = new HttpLink({
  uri: `http://localhost:${SERVER_PORT}/graphql`
});

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  link,
});

/*********End Initialization */


injectStyles();
ReactDOM.render(
    <ApolloProvider client={client}>    
        <Fragment>
          <PageContainer>
            <Router primary={false} component={Fragment}>
              <Selector 
                path='/' 
                client={client} />

              <PendingTxs 
                path='/pending_transactions/:multisigAddress' 
                client={client} />
            </Router>
          </PageContainer>
        </Fragment>
    </ApolloProvider>,   
    document.getElementById('root')
);







