
import React, { Fragment, Component } from 'react';
import { WithApolloClient } from 'react-apollo';
import { RouteComponentProps } from '@reach/router';
import Error, { ErrorProps } from '../components/error';
import { AppData } from '../__generated__/AppData';
import styled from 'react-emotion';
import { Dashboard } from '../components';
import ApolloClient, { ApolloError } from 'apollo-client';
import { GET_APP_DATA } from "../queries";


interface PageProps extends WithApolloClient<RouteComponentProps> {
//   appData: AppData | ApolloError | undefined;
//   multisigAddress: string | undefined;
}

interface StateProps{
  isHardcodedMember: {
    loading: Boolean,
    error: ErrorProps | undefined,
    data: any
  }
}


export default class Selector extends Component<PageProps, StateProps> {

  state = {
    isHardcodedMember: {
      loading: false,
      error: undefined,
      data: undefined
    }
  }

  componentDidMount = async () => {
      const { client } = this.props;
      console.log(client.cache)
      const appData = await client.query<AppData>({
        query: GET_APP_DATA
      })
      console.log("aca2")
      console.log(appData)
  }



  appDataContent = (appData: AppData | undefined) => {
    return  (
      <>
        <Header>
            <Row>
              <HeaderTitle>DNA</HeaderTitle>
              <HeaderContainer>
                <HeaderValue>{appData?.getDnaAddress}</HeaderValue>
              </HeaderContainer>
            </Row>
            <Row>
              <HeaderTitle>My Address</HeaderTitle>
              <HeaderContainer>
                <HeaderValue>{appData?.myAddress}</HeaderValue>
              </HeaderContainer>
            </Row>
        </Header>
        <Dashboard />  
      </>
    )
  }

  render() {
      const {client} = this.props;

    //   if(appData instanceof ApolloError) {
    //       return <Error error={appData} />;
    //   }
    //   console.log(multisigAddress);
    //   console.log(appData)
    return (<></>)
  }
}



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
  