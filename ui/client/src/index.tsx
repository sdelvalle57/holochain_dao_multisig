
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import styled from 'react-emotion';

import {typeDefs} from './resolvers';

import injectStyles from './styles';
import { IS_HARDCODED_MEMBER, GET_MASTER_MULTISIG_ADDRESS, GET_APP_DATA } from './queries';
import { Loading, Error, Start, Alert, PageContainer, Dashboard } from './components';
import { MasterMultisigAddress } from './__generated__/MasterMultisigAddress';
import { Type } from './components/alert';
import { Router, RouteComponentProps } from '@reach/router';
import { AppData } from './__generated__/AppData';


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

interface PageProps extends RouteComponentProps {
 
}

const RenderPage: React.FC<PageProps> = () => {
  const isHardcodedMember = useQuery(IS_HARDCODED_MEMBER);
  const multisigAddress = useQuery<MasterMultisigAddress>(GET_MASTER_MULTISIG_ADDRESS);
  const appData = useQuery<AppData>(GET_APP_DATA);

  if (isHardcodedMember.loading || appData.loading) return <Loading />;
  if (isHardcodedMember.error) return <Error error={isHardcodedMember.error} />;
  if (appData.error) return <Error error={appData.error} />;

  if(multisigAddress.error) {
    for(let j = 0; j < multisigAddress.error.graphQLErrors.length; j++) {
      const err = multisigAddress.error.graphQLErrors[j];
      if(err.extensions?.exception.error === "Multisig has not been started or user is not Member") {
        if(isHardcodedMember.data) {
          return (
            <>
              <Header>
                  <HeaderTitle>DNA</HeaderTitle>
                  <HeaderContainer>
                    <HeaderValue>{appData.data?.getDnaAddress}</HeaderValue>
                  </HeaderContainer>
              </Header>
              <Start />
            </>


          )
        } else {
          return <Alert type={Type.Danger} text = "Multisig Has not yet started, requires a Hardcoded Member"/>
        }
      }
    }
  }
  
  return  (
    <>
       <Header>
          <Row>
            <HeaderTitle>DNA</HeaderTitle>
            <HeaderContainer>
              <HeaderValue>{appData.data?.getDnaAddress}</HeaderValue>
            </HeaderContainer>
          </Row>
          <Row>
            <HeaderTitle>My Address</HeaderTitle>
            <HeaderContainer>
              <HeaderValue>{appData.data?.myAddress}</HeaderValue>
            </HeaderContainer>
          </Row>
      </Header>
      <Dashboard />  
    </>
  )
}

const Global = styled('div')({
  fontSize: '12px'
})

const Row = styled('div')({
  marginBottom: '15px',
  display: 'inline-flex',
  flexWrap: 'wrap',
})

const Header = styled('div')({
  width: '735px',
  background: '#F3F0EB',
  border: '1px solid #C49E57',
  boxSizing: 'border-box',
  display: 'block',
  justifyContent: 'space-around',
  paddingTop: '20px',
  margin: 'auto'
})

const HeaderContainer = styled('div')({
  width: '500px',
  height: '36px',
  background: '#FFFFFF',
  border: '1px solid #E7E1D7',
  boxSizing: 'border-box',
  display: 'inline-flex',
  lineHeight: '20px',
  textAlign: 'center',
})

const HeaderValue = styled('span')({
  fontFamily: 'Avenir',
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: '12px',
  lineHeight: '30px',
  color: '#000000',
  margin: 'auto',
})

const HeaderTitle = styled('div')({
  fontFamily: 'Avenir',
  fontStyle: 'normal',
  fontWeight: 800,
  fontSize: '12px',
  lineHeight: '35px',
  textAlign: 'right',
  textTransform: 'uppercase',
  color: '#C49E57',
  marginRight: '2rem',
  width: '95px',
})

injectStyles();
ReactDOM.render(
    <ApolloProvider client={client}>    
      <Global>
        <Fragment>
          <PageContainer>
            <Router primary={false} component={Fragment}>
              <RenderPage path='/' />
            </Router>
          </PageContainer>
        </Fragment>
      </Global>
    </ApolloProvider>,   
    document.getElementById('root')
);



