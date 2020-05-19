import React,  { Component, ReactNode } from 'react';
import { WithApolloClient } from 'react-apollo';
import { RouteComponentProps } from '@reach/router';
import styled from 'react-emotion';

import { GetTransactionList, GetTransactionListVariables } from '../__generated__/GetTransactionList';
import { 
    GetTransaction, 
    GetTransactionVariables, 
    GetTransaction_getTransaction_entry_action,
    GetTransaction_getTransaction_entry_links
} from '../__generated__/GetTransaction';

import { GET_TRANSACTIONS, GET_TRANSACTION } from '../queries';

import Loading from '../components/loading';
import Error from '../components/error';
import Alert, { Type } from '../components/alert';
import { getMethodName } from '../common/helpers';

import InfoIcon from '../assets/images/infoIcon.png'
import { colors } from '../styles';

interface PageProps extends WithApolloClient<RouteComponentProps> {
    multisigAddress?: string;
}

interface StateProps {
    loading: boolean,
    error: Object | null,
    transactionList: GetTransaction[]
}

export default class PendingTxs extends Component<PageProps, StateProps> {

    state = {
        loading: true,
        error: null,
        transactionList: []
    }

    componentDidMount = async () => {
        const { client, multisigAddress } = this.props;
        if(multisigAddress) {
            try {
                const transactions = await client.query<GetTransactionList, GetTransactionListVariables>({
                    query: GET_TRANSACTIONS,
                    variables: {
                        multisig_address: multisigAddress
                    }
                })
                if(transactions.data.getTransactionList.length > 0) {
                    await transactions.data.getTransactionList.map( async tx => {
                        if(tx) {
                            const transactionData = await client.query<GetTransaction, GetTransactionVariables>({
                                query: GET_TRANSACTION,
                                variables: {
                                    entry_address: tx,
                                    multisig_address: multisigAddress
                                }
                            })
    
                            this.setState(prevState => ({
                                transactionList: [...prevState.transactionList, transactionData.data]
                            }))
                        }
                    })
                                
                }
            } catch (error) {
                this.setState({error: <Error error={error} />})
            }
        }
        this.setState({ loading: false })
    }

    sortData = () => {
        const { transactionList } = this.state;
        const cols = []
        let rows: any = [];
        const pendingTxs = transactionList.filter((tx: GetTransaction) => !tx.getTransaction.executed)
        for(let j = 0; j < pendingTxs.length; j++){
            const key = pendingTxs[j]
            rows.push(key);
            if((j+1) % 4 === 0 || (j + 1) === pendingTxs.length) {
                cols.push(rows);
                rows = []
            }
        }
        return cols
    }

    getEntryData = (entry: string): string => {
        return JSON.stringify(JSON.parse(entry), undefined, 3);
    }

    getAction = (action: GetTransaction_getTransaction_entry_action | null): ReactNode => {
        if(action) {
            if(!action.COMMIT && !action.REMOVE && !action.UPDATE) return (
                <Values>
                    <ContentTitle>Action</ContentTitle>
                    <ContentValue>Commit</ContentValue>
                </Values>
            )
            else if(!action.COMMIT && ! action.REMOVE && action.UPDATE) {
                return(
                    <div>
                        <Values>
                            <ContentTitle>Action</ContentTitle>
                            <ContentValue>Update</ContentValue>
                        </Values>
                        <small><strong>Entry:</strong> {action.UPDATE}</small>
                    </div>
                )
            }
            else if(!action.COMMIT && action.REMOVE && !action.UPDATE) {
                return(
                    <div>
                        <Values>
                            <ContentTitle>Action</ContentTitle>
                            <ContentValue>Remove</ContentValue>
                        </Values>
                        <small><strong>Entry:</strong> {action.REMOVE}</small>
                    </div>
                )
            }
        }
        return null;
    }

    getLinks = (links: (GetTransaction_getTransaction_entry_links | null)[] | null): ReactNode => {
        if(!links) return null;
        return(
            <>
                <Title>Entry Links</Title>
                {
                    links.map(l => {
                        delete l?.__typename;
                        return(
                            <PRE>{JSON.stringify(l, undefined, 3)}</PRE>
                        )
                    })
                }
            </>
        )
    }

    renderContent = (tx: GetTransaction, index: number): ReactNode => {
        console.log(tx)
        return(
            <Card key={index}>
                <Title>{getMethodName(tx.getTransaction.title)}</Title> 
                <ImageCard src = {InfoIcon}/>
                <CardContainer>
                    <Content>
                        <Title>Description</Title>
                        <Value>{tx.getTransaction.description}</Value>
                        <HR />

                        <Title>Submitter</Title>
                        <Value>{tx.getTransaction.creator.member.name}</Value>
                        <Value><small>{tx.getTransaction.creator.member.address}</small></Value>
                        <HR />

                        
                        <Title>Entry Data</Title>
                        <Values>
                            <ContentTitle>Type</ContentTitle>
                            <ContentValue>{tx.getTransaction.entry_data.App[0]}</ContentValue>
                        </Values>

                        <Values>
                            <ContentTitle>Required</ContentTitle>
                            <ContentValue>{tx.getTransaction.required}</ContentValue>
                        </Values>
                        
                        {this.getAction(tx.getTransaction.entry_action)}

                        <PRE>{this.getEntryData(tx.getTransaction.entry_data.App[1])}</PRE>
                        <HR />


                        {this.getLinks(tx.getTransaction.entry_links)}



                    </Content>
                </CardContainer>
            </Card>
        )
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
                   sorted.map((col, i) => {
                       return(
                           <Row key={i}>
                               {
                                   col.map((tx: GetTransaction, index: number) => {
                                       return (
                                           <Col key={index}>
                                                {this.renderContent(tx, index)}
                                           </Col>
                                       )
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
