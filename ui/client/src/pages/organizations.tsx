import React,  { Component, ReactNode } from 'react';
import { WithApolloClient, Query } from 'react-apollo';
import { RouteComponentProps } from '@reach/router';
import styled from 'react-emotion';
import { Map } from 'immutable';

import { GetTransactionList, GetTransactionListVariables } from '../__generated__/GetTransactionList';
import { 
    GetTransaction, 
    GetTransactionVariables, 
    GetTransaction_getTransaction_entry_action,
    GetTransaction_getTransaction_entry_links
} from '../__generated__/GetTransaction';

import { GET_TRANSACTIONS, GET_TRANSACTION, GET_APP_DATA, GET_ORGANIZATIONS, GET_ORGANIZATION } from '../queries';

import Loading from '../components/loading';
import Error from '../components/error';
import Alert, { Type } from '../components/alert';
import { getMethodName } from '../common/helpers';

import InfoIcon from '../assets/images/infoIcon.png'
import { colors } from '../styles';
import { Button } from '../components';
import { SignTransaction, SignTransactionVariables } from '../__generated__/SignTransaction';
import { SIGN_TRANSACTION, EXECUTE_TRANSACTION } from '../mutations';
import { ApolloError } from 'apollo-client';
import { AppData } from '../__generated__/AppData';
import { ExecuteTransaction, ExecuteTransactionVariables } from '../__generated__/ExecuteTransaction';
import { GetOrganizationsVariables, GetOrganizations } from '../__generated__/GetOrganizations';
import { GetOrganizationVariables, GetOrganization } from '../__generated__/GetOrganization';

interface PageProps extends WithApolloClient<RouteComponentProps> {
    multisigAddress?: string;
}

interface StateProps {
    loading: boolean,
    error?: Object,
    myAddress: string | null;
    organizationsEntryList: (string | null)[];
    organizationsList: Map<any, any>,

}

export default class Organizations extends Component<PageProps, StateProps> {

    state = {
        loading: true,
        error: undefined,
        myAddress: null,
        organizationsEntryList: [],
        organizationsList: Map<string, any>(),
    }

    componentDidMount = async () => {
        const { client, multisigAddress } = this.props;
        if(multisigAddress) {

            try {
                const organizations = await client.query<GetOrganizations, GetOrganizationsVariables>({
                    query: GET_ORGANIZATIONS,
                    fetchPolicy: 'network-only',
                    variables: {
                        multisig_address: multisigAddress
                    }
                })
                if(organizations.data.getOrganizations.length > 0) {
                    this.setState({organizationsEntryList: organizations.data.getOrganizations})
                    organizations.data.getOrganizations.map( async entry_address => {
                        if(entry_address) {
                            this.fetchOrganizationsData(entry_address)
                        }
                    })
                }

                
            } catch (error) {
                this.setState({error: <Error error={error} />})
            }
        }
        this.setState({ loading: false })
    }

    fetchOrganizationsData = async (address: string) => {
        const { client } = this.props;
        const organizartionData = await client.query<GetOrganization, GetOrganizationVariables>({
            query: GET_ORGANIZATION,
            fetchPolicy: 'network-only',
            variables: {
                address,
            }
        })
        this.updateOrgList(address, organizartionData.data)
    }

    updateOrgList= (entry: string, value: any) => {
        if(this.state.organizationsList.has(entry)) {
            this.setState(({organizationsList}) => ({
                organizationsList: organizationsList.update(entry, ()=> value)
            }))
        } else {
            this.setState(({organizationsList}) => ({
                organizationsList: organizationsList.set(entry, value)
            }))
        }
    }

    sortData = () => {
        const { organizationsEntryList } = this.state;
        const cols: any = []
        let rows: any = [];
        
        for(let j = 0; j < organizationsEntryList.length; j++){
            const key = organizationsEntryList[j];
            rows.push(key);
            if((j+1) % 4 === 0 || (j + 1) === organizationsEntryList.length) {
                cols.push(rows);
                rows = []
            }
        }
        return cols
    }
    renderContent = (data: GetOrganization, entry_address: string) => {

        return(
            <Card key={entry_address}>
            <Title>{data.getOrganization.name}</Title> 
            <ImageCard src = {InfoIcon}/>
            <CardContainer>
                <Content>
                    <Title>Description</Title>
                    <Value>{data.getOrganization.description}</Value>
                    <HR />

                    <Title>Address</Title>
                    <Value><small>{entry_address}</small></Value>
                    <HR />

                    <Title>Owner</Title>
                    <Value><small>{data.getOrganization.owner}</small></Value>
                    <HR />


                </Content>
            </CardContainer>
        </Card> 

        )
    }

    renderOrganization = (entry_address: string, index: number) => {
        const {organizationsList} = this.state;
        const organization: GetOrganization = organizationsList.get(entry_address);
        if(organization) {
            return (
                <Col key={index}>
                    {
                        this.renderContent(organization, entry_address)
                    }
                </Col>
            )
        }
        return null;
    }
    
    render() {
        const { loading, error } = this.state;
        const sorted = this.sortData();
        const { multisigAddress } = this.props;
        if(!multisigAddress) return <Alert type={Type.Danger} text="Error trying to fetch multisig" />
        if(error) return error;
        if(loading) return <Loading />
        return (
            <Container>
                {
                    sorted.map((col: any, i: number) => {
                       return(
                           <Row key={i}>
                               {
                                   col.map((entry_address: string, index: number) => {
                                        return this.renderOrganization(entry_address, index)   
                                    
                                   })
                               }

                           </Row>
                       )
                   })
                }
            </Container>
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

const ContentTitle = styled('div')({
    fontWeight: 800,
    lineHeight: '19px',
    textAlign: 'end',
    color: colors.title,
    flex: '0 0 50%',
    maxWidth: '50%',
    position: 'relative',
    width: '100%',
    paddingRight: '15px',
    paddingLeft: '15px',
    wordWrap: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const ContentValue = styled('div')({
    fontWeight: 800,
    lineHeight: '19px',
    textAlign: 'start',
    flex: '0 0 50%',
    maxWidth: '50%',
    fontStyle: 'normal',
    position: 'relative',
    width: '100%',
    paddingRight: '15px',
    paddingLeft: '15px',
    wordWrap: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const Values = styled('div')({
    display: 'flex',
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

const PRE = styled('pre')({
    textAlign: 'left',
    marginTop: '-10px',
    fontSize: '9px',
    overflowY: 'hidden',
    overflowX: 'auto',
    background: '#F7F7F7',
    margin: '3px 15px 0px 0px'
})


const SignButton = styled(Button)({
    minWidth: '150px',
    height: '40px',
    lineHeight: '40px',
    marginTop: '1em'
})