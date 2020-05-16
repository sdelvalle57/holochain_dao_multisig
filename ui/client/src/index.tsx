import React, { Fragment } from 'react';
import { ApolloClient, ApolloError } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';
import ReactDOM from 'react-dom';
import styled from 'react-emotion';


import injectStyles from './styles';
import { PageContainer } from './components';
import { Router } from '@reach/router';

import { Selector } from './pages';
import { AppData } from './__generated__/AppData';

import { resolvers, typeDefs } from './resolvers';

/*Start initialization */
const cache = new InMemoryCache();
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT ? process.env.REACT_APP_SERVER_PORT : 4000;
console.log(SERVER_PORT, process.env.REACT_APP_SERVER_PORT, process.env.PORT)
const link = new HttpLink({
  uri: `http://localhost:${SERVER_PORT}/graphql`
});

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  link,
  resolvers,
  typeDefs
});


const data:{ multisigAddress: String | null, appData: AppData | null } = {
  multisigAddress: null,
  appData: null
}

client.cache.writeData({
    data
});

/*********End Initialization */


/*********Component */



// const RenderPage: React.FC<PageProps> = () => {
//  const isHardcodedMember = useQuery(IS_HARDCODED_MEMBER);

//   if (isHardcodedMember.loading) return <Loading />;
//   if (isHardcodedMember.error) return <Error error={isHardcodedMember.error} />;
//   if (appData instanceof ApolloError) return <Error error={appData} />;
  

//   if(!multisigAddress && notStarted) {
//     if(isHardcodedMember.data) {
//       return <Start />
//     } else {
//       return <Alert type={Type.Danger} text = "Multisig Has not yet started, requires a Hardcoded Member"/>
//     }
//   }

//   return appDataContent(appData)
  
// }

const Global = styled('div')({
  fontSize: '12px'
})

injectStyles();
ReactDOM.render(
    <ApolloProvider client={client}>    
      <Global>
        <Fragment>
          <PageContainer>
            <Router primary={false} component={Fragment}>
              <Selector 
                path='/' 
                client={client} />
            </Router>
          </PageContainer>
        </Fragment>
      </Global>
    </ApolloProvider>,   
    document.getElementById('root')
);







