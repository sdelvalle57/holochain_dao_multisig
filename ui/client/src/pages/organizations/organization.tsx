import React,  { Component } from 'react';
import { WithApolloClient, Query } from 'react-apollo';
import { RouteComponentProps } from '@reach/router';
import styled from 'react-emotion';

import { GET_ORGANIZATION } from '../../queries';

import Loading from '../../components/loading';

import InfoIcon from '../../assets/images/infoIcon.png'
import { colors } from '../../styles';
import { GetOrganizationVariables, GetOrganization } from '../../__generated__/GetOrganization';
import { Error, Alert } from '../../components';
import { GetOrganizations } from '../../__generated__/GetOrganizations';
import { Type } from '../../components/alert';

interface PageProps extends WithApolloClient<RouteComponentProps> {
    entryAddress?: string;
}

interface StateProps {
    myAddress: string | null;
}

export default class Organization extends Component<PageProps, StateProps> {

    state = {
        myAddress: null,
    }

    renderContent = () => {

        return(
            <Card >
            <Title>Multisig</Title> 
            <ImageCard src = {InfoIcon}/>
            <CardContainer>
                <Content>
                    <Title>Description</Title>
                    <Value></Value>
                    <HR />

                    <Title>Address</Title>
                    <Value><small></small></Value>
                    <HR />

                    <Title>Owner</Title>
                    <Value><small></small></Value>
                    <HR />


                </Content>
            </CardContainer>
        </Card> 

        )
    }

    
    render() {
        if(!this.props.entryAddress) return <Alert type={Type.Danger} text="No entry Address" />
        return  (
            <Query<GetOrganization, GetOrganizationVariables>query = { GET_ORGANIZATION } 
            fetchPolicy = "network-only"
            variables = {{
                entry_address: this.props.entryAddress
              }} >
                  {({data, error, loading}) => {
                    if(error) return <Error error={error} />;
                    if(loading) return <Loading />
                    return (
                        <>
                        <Header>
                            <Row>
                                <HeaderTitle>Name</HeaderTitle>
                                <HeaderContainer>
                                <HeaderValue>{data?.getOrganization.name}</HeaderValue>
                                </HeaderContainer>
                            </Row>
                            <Row>
                                <HeaderTitle>Address</HeaderTitle>
                                <HeaderContainer>
                                <HeaderValue>{this.props.entryAddress}</HeaderValue>
                                </HeaderContainer>
                            </Row>
                            <Row>
                                <HeaderTitle>Owner</HeaderTitle>
                                <HeaderContainer>
                                <HeaderValue>{data?.getOrganization.owner}</HeaderValue>
                                </HeaderContainer>
                            </Row>
                            <Row>
                                <HeaderTitle>Parent Multisig</HeaderTitle>
                                <HeaderContainer>
                                <HeaderValue>{data?.getOrganization.multisig_address}</HeaderValue>
                                </HeaderContainer>
                            </Row>
                            <Row>
                                <HeaderTitle>Description</HeaderTitle>
                                <HeaderContainer>
                                <HeaderValue>{data?.getOrganization.description}</HeaderValue>
                                </HeaderContainer>
                            </Row>
                        </Header>
                        {this.renderContent()}
                        </>
                    )
                    
                }}
              
            </Query>
          )
    }
}

const Container = styled('div')({
    marginTop: '3em',
    maxWidth: '1567px',
    overflowY: 'auto',
    overflowX: 'hidden'
});

const Row = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    marginRight: '-15px',
    marginLeft: '-15px',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const Col = styled('div')({
    flex: '0 0 25%',
    maxWidth: '25%',
    position: 'relative',
    width: '100%',
    paddingRight: '15px',
    paddingBottom: '15px',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const Card = styled('div')({
    height: '450px',
    minHeight: '450px',
    width: '330px',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
    margin: '20px 20px 20px 0px',
    maxHeight: '220px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    wordWrap: 'break-word',
    backgroundColor: '#FFF',
    backgroundClip: 'border-box',
    border: '1px solid rgba(0,0,0,.125)',
    padding: '15px 25px',
    borderRadius: '0.25rem',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const Title = styled('div')({
    fontStyle: 'normal',
    fontWeight: 800,
    lineHeight: '19px',
    textAlign: 'center',
    color: colors.title,
    marginTop: '0.5em',
    wordWrap: 'break-word',
    whiteSpace: 'initial',
    minHeight: '25px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const ImageCard = styled('img')({
    width: '60px',
    height: '60px',
    background: 'rgba(231, 225, 215, 0.5)',
    border: '1px solid #C49E57',
    boxSizing: 'border-box',
    margin: '0px auto 20px auto',
    padding: '14px'
})

const CardContainer = styled('div')({
    overflowX: 'hidden',
    overflowY: 'auto',
    wordWrap: 'break-word',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const Content = styled('div')({
    display: 'block',
    flexWrap: 'wrap',
    marginRight: '-15px',
    marginLeft: '-15px',
    wordWrap: 'break-word',
})

const Value = styled('div')({
    padding: '0px 20px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    wordWrap: 'break-word',
})

const HR = styled('hr')({
    width: '80%',
    borderTop: '1px',
    marginBottom: '10px'
})


const Header = styled('div')({
    width: '735px',
    background: '#F3F0EB',
    border: '1px solid #C49E57',
    boxSizing: 'border-box',
    display: 'block',
    justifyContent: 'space-around',
    paddingTop: '20px',
    margin: 'auto',
    paddingBottom: '20px'
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
    width: '165px',
  })
  