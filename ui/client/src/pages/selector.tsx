
import React, { Fragment, Component } from 'react';
import { WithApolloClient, Query } from 'react-apollo';
import { RouteComponentProps } from '@reach/router';
import Error, { ErrorProps } from '../components/error';
import { AppData } from '../__generated__/AppData';
import styled from 'react-emotion';
import { Dashboard, Loading, Start, Alert } from '../components';
import ApolloClient, { ApolloError } from 'apollo-client';
import { GET_APP_DATA, GET_MASTER_MULTISIG_ADDRESS, IS_HARDCODED_MEMBER } from "../queries";
import { MasterMultisigAddress } from '../__generated__/MasterMultisigAddress';
import { IsHardcodedMember } from '../__generated__/IsHardcodedMember';
import { Type } from '../components/alert';
import { threadId } from 'worker_threads';


interface PageProps extends WithApolloClient<RouteComponentProps> {
//   appData: AppData | ApolloError | undefined;
//   multisigAddress: string | undefined;
}

interface StateProps{
    multisigAddress: string | null;
    error: boolean;
    loading: boolean;
}


export default class Selector extends Component<PageProps, StateProps> {

  state = {
    multisigAddress: null,
    error: false,
    loading: true
  }

  componentDidMount = async (): Promise<void> => {
        await this.fetchMultisig();
  }

  setMultisig = (multisigAddress: string) => {
      this.setState({
          multisigAddress,
          error: false,
          loading: false
      })
  }

  fetchMultisig = async (): Promise<void> => {
        const { client } = this.props;
        try {
            const response = await client.query<MasterMultisigAddress>({
                query: GET_MASTER_MULTISIG_ADDRESS,
            });
            const multisigAddress = response.data.getMultisigAddress.entry;
            if(multisigAddress) {
                this.setState({
                    multisigAddress, 
                    error: false,
                    loading: false
                });
            }
        } catch (e) {
            for(let j = 0; j < e.graphQLErrors.length; j++) {
                const err = e.graphQLErrors[j];
                if(err.extensions?.exception.error === "Multisig has not been started or user is not Member") {
                    this.setState({
                        multisigAddress: null,
                        error: false,
                        loading: false
                    })
                    return;
                }
                this.setState({
                    multisigAddress: null,
                    error: true,
                    loading: false
                })
            }
        }
  }

  renderAppData = () => {
      return(
          <Query<AppData> query = { GET_APP_DATA } >
              {({data, error, loading}) => {
                  if(error) return <Error error={error} />;
                  if(loading) return <Loading />
                  if(!data?.getDnaAddress || !data.myAddress) return <Alert type={Type.Danger} text = "Error trying to fetch AppData"/>
                  return  (
                    <>
                      <Header>
                          <Row>
                            <HeaderTitle>DNA</HeaderTitle>
                            <HeaderContainer>
                              <HeaderValue>{data?.getDnaAddress}</HeaderValue>
                            </HeaderContainer>
                          </Row>
                          <Row>
                            <HeaderTitle>My Address</HeaderTitle>
                            <HeaderContainer>
                              <HeaderValue>{data?.myAddress}</HeaderValue>
                            </HeaderContainer>
                          </Row>
                      </Header>
                    </>
                  )
              }}
          </Query>
      )
  }

  renderStartContent = () => {
    return (
        <Query<IsHardcodedMember> query = { IS_HARDCODED_MEMBER }>
            {({data, error, loading}) => {
                if(error) return <Error error={error} />;
                if(loading) return <Loading />
                if(!data?.isHardcodedMember) return <Alert type={Type.Danger} text = "Multisig Has not yet started, requires a Hardcoded Member"/>
                return (
                    <>
                        {this.renderAppData()}
                        <Start setMultisig = {this.setMultisig} />
                    </>
                )
            }}
        </Query>
    )
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
    const { multisigAddress, error, loading } = this.state;
    if(loading) return <Loading />
    if(multisigAddress) {
        return (
            <>
                {this.renderAppData()}
                <Dashboard />
            </>
        )
    } 

    if(error) {
        return <Alert type={Type.Danger} text = "Multisig Has not yet started, requires a Hardcoded Member"/>
    }

    return this.renderStartContent()
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
  