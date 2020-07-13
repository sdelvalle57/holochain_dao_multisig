import React,  { Component } from 'react';
import { WithApolloClient } from 'react-apollo';
import { RouteComponentProps } from '@reach/router';
import styled from 'react-emotion';
import { Map } from 'immutable';
import { navigate } from '@reach/router';

import { GET_ORGANIZATION, GET_MY_ORGANIZATIONS } from '../../queries';

import Loading from '../../components/loading';
import Error from '../../components/error';

import InfoIcon from '../../assets/images/infoIcon.png'
import { colors } from '../../styles';
import { GetOrganizationVariables, GetOrganization } from '../../__generated__/GetOrganization';
import { GetMyOrganizations } from '../../__generated__/GetMyOrganizations';

interface PageProps extends WithApolloClient<RouteComponentProps> {
}

interface StateProps {
    loading: boolean,
    error?: Object,
    myAddress: string | null;
    organizationsEntryList: (string | null)[];
    organizationsList: Map<any, any>,

}

export default class MyOrganizations extends Component<PageProps, StateProps> {

    state = {
        loading: true,
        error: undefined,
        myAddress: null,
        organizationsEntryList: [],
        organizationsList: Map<string, any>(),
    }

    componentDidMount = async () => {
        const { client } = this.props;
        try {
            const organizations = await client.query<GetMyOrganizations>({
                query: GET_MY_ORGANIZATIONS,
                fetchPolicy: 'network-only'
            })
            if(organizations.data.getMyOrganizations.length > 0) {
                this.setState({organizationsEntryList: organizations.data.getMyOrganizations})
                organizations.data.getMyOrganizations.map( async entry_address => {
                    if(entry_address) {
                        this.fetchOrganizationsData(entry_address)
                    }
                })
            }

            
        } catch (error) {
            this.setState({error: <Error error={error} />})
        }
        this.setState({ loading: false })
    }

    fetchOrganizationsData = async (entry_address: string) => {
        const { client } = this.props;
        const organizartionData = await client.query<GetOrganization, GetOrganizationVariables>({
            query: GET_ORGANIZATION,
            fetchPolicy: 'network-only',
            variables: {
                entry_address,
            }
        })
        this.updateOrgList(entry_address, organizartionData.data)
    }

    updateOrgList= (entry_address: string, value: any) => {
        if(this.state.organizationsList.has(entry_address)) {
            this.setState(({organizationsList}) => ({
                organizationsList: organizationsList.update(entry_address, ()=> value)
            }))
        } else {
            this.setState(({organizationsList}) => ({
                organizationsList: organizationsList.set(entry_address, value)
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

    viewOrganization = (entryAddress: string) => {
        navigate(`/organization/${entryAddress}`)
    }

    renderContent = (data: GetOrganization, entry_address: string) => {

        return(
            <Card onClick={()=> this.viewOrganization(entry_address)} key={entry_address}>
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
    },
    '&:hover': {
        boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
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