import React,  { Component, ReactNode } from 'react';
import { WithApolloClient } from 'react-apollo';
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

import { GET_TRANSACTIONS, GET_TRANSACTION, GET_APP_DATA } from '../queries';

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

interface PageProps extends WithApolloClient<RouteComponentProps> {
    multisigAddress?: string;
}

interface StateProps {
    loading: boolean,
    error?: Object,
    myAddress: string | null;
    transactionsEntryList: (string | null)[];
    transactionsList: Map<any, any>,
    txResponseR: Map<any, any>

}

export default class PendingTxs extends Component<PageProps, StateProps> {

    state = {
        loading: true,
        error: undefined,
        myAddress: null,
        transactionsEntryList: [],
        transactionsList: Map<string, any>(),
        txResponseR: Map<string, any>()
    }

    componentDidMount = async () => {
        const { client, multisigAddress } = this.props;
        if(multisigAddress) {

            try {

                const myData = await client.query<AppData>({
                    query: GET_APP_DATA
                });
                this.setState({myAddress: myData.data.myAddress})

                const transactions = await client.query<GetTransactionList, GetTransactionListVariables>({
                    query: GET_TRANSACTIONS,
                    fetchPolicy: 'network-only',
                    variables: {
                        multisig_address: multisigAddress
                    }
                })
                if(transactions.data.getTransactionList.length > 0) {
                    this.setState({transactionsEntryList: transactions.data.getTransactionList})
                    transactions.data.getTransactionList.map( async entry_address => {
                        if(entry_address) {
                            this.fetchTransactionData(entry_address)
                        }
                    })
                }
                
            } catch (error) {
                this.setState({error: <Error error={error} />})
            }
        }
        this.setState({ loading: false })
    }

    fetchTransactionData = async (entry_address: string) => {
        const { client } = this.props;
        const transactionData = await client.query<GetTransaction, GetTransactionVariables>({
            query: GET_TRANSACTION,
            fetchPolicy: 'network-only',
            variables: {
                entry_address,
            }
        })
        this.updateTxList(entry_address, transactionData.data)
    }

    sortData = () => {
        const { transactionsEntryList } = this.state;
        const cols: any = []
        let rows: any = [];
        
        for(let j = 0; j < transactionsEntryList.length; j++){
            const key = transactionsEntryList[j];
            rows.push(key);
            if((j+1) % 4 === 0 || (j + 1) === transactionsEntryList.length) {
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
                    links.map((l, i) => {
                        delete l?.__typename;
                        return(
                            <PRE key={i}>{JSON.stringify(l, undefined, 3)}</PRE>
                        )
                    })
                }
            </>
        )
    }

    updateTxState = (entry: string, value: any) => {
        if(this.state.txResponseR.has(entry)) {
            this.setState(({txResponseR}) => ({
                txResponseR: txResponseR.update(entry, ()=> value)
            }))
        } else {
            this.setState(({txResponseR}) => ({
                txResponseR: txResponseR.set(entry, value)
            }))
        }
    }

    updateTxList= (entry: string, value: any) => {
        if(this.state.transactionsList.has(entry)) {
            this.setState(({transactionsList}) => ({
                transactionsList: transactionsList.update(entry, ()=> value)
            }))
        } else {
            this.setState(({transactionsList}) => ({
                transactionsList: transactionsList.set(entry, value)
            }))
        }
    }

    signTransaction = async (entry_address: string) => {
        const { client, multisigAddress } = this.props;
        if(multisigAddress) {
            try {
                this.updateTxState(entry_address, true)
                
                const response: any = await client.mutate<SignTransaction, SignTransactionVariables>({
                    mutation: SIGN_TRANSACTION,
                    variables: {
                        entry_address,
                        multisig_address: multisigAddress
                    },
                });
                
                if(response.data?.signTransaction.entry) {
                    await setTimeout(() => {
                        this.updateTxState(entry_address, response.data?.signTransaction.entry)
                        this.fetchTransactionData(entry_address)
                    }, 1000)
                }
            } catch(err) {
                this.updateTxState(entry_address, err)
            }
        }
    }

    executeTransaction = async (entry_address: string) => {
        const { client, multisigAddress } = this.props;
        if(multisigAddress) {
            try {
                this.updateTxState(entry_address, true)
                
                const response = await client.mutate<ExecuteTransaction, ExecuteTransactionVariables>({
                    mutation: EXECUTE_TRANSACTION,
                    variables: {
                        entry_address,
                        multisig_address: multisigAddress
                    },
                });
                
                if(response.data?.executeTransaction.entry) {
                    setTimeout(() => {
                        this.updateTxState(entry_address, response.data?.executeTransaction.entry)
                        this.fetchTransactionData(entry_address)
                    }, 1000)
                }
            } catch(err) {
                this.updateTxState(entry_address, err)
            }
        }
    }

    renderSignButton = (entryAddress: string, tx: GetTransaction) => {
        const { myAddress } = this.state;
        if(!myAddress ) return null;

        let signed = false;

        tx.getTransaction.signed?.map(s => {
            if(s.member.member.address === myAddress) signed = true;
        })

        if(signed && tx.getTransaction.signed) {
            if(tx.getTransaction.signed?.length >= tx.getTransaction.required) {
                return(
                    <SignButton onClick={() => this.executeTransaction(entryAddress)}>
                        Execute
                    </SignButton>
                )
            }
            return null
        }
        
        return(
            <SignButton onClick={() => this.signTransaction(entryAddress)}>
                Sign
            </SignButton>
        )
    }

    renderContent = (data: GetTransaction, entry_address: string) => {
        const { txResponseR } = this.state;

        if(txResponseR.has(entry_address)){
            if(txResponseR.get(entry_address) === true) return <Card key={entry_address}><Loading /></Card>
            else if(txResponseR.get(entry_address) instanceof ApolloError) {
                return <Card key={entry_address}><Error error={txResponseR.get(entry_address)} /></Card>
            }
        }  

        return(
            <Card key={entry_address}>
            <Title>{getMethodName(data.getTransaction.title)}</Title> 
            <ImageCard src = {InfoIcon}/>
            <CardContainer>
                <Content>
                    <Title>Description</Title>
                    <Value>{data.getTransaction.description}</Value>
                    <HR />

                    <Title>Submitter</Title>
                    <Value>{data.getTransaction.creator.member.name}</Value>
                    <Value><small>{data.getTransaction.creator.member.address}</small></Value>
                    <HR />

                    <Title>Signatures</Title>
                    {data.getTransaction.signed?.map(({member}) => {
                        return(
                            <>
                            <Value>{member.member.name}</Value>
                            <Value><small>{member.member.address}</small></Value>
                            </>
                        )
                    })}
                    <HR />

                    <Title>Entry Data</Title>
                    <Values>
                        <ContentTitle>Type</ContentTitle>
                        <ContentValue>{data.getTransaction.entry_data.App[0]}</ContentValue>
                    </Values>

                    <Values>
                        <ContentTitle>Required</ContentTitle>
                        <ContentValue>{data.getTransaction.required}</ContentValue>
                    </Values>
                    
                    {this.getAction(data.getTransaction.entry_action)}

                    <PRE>{this.getEntryData(data.getTransaction.entry_data.App[1])}</PRE>
                    <HR />


                    {this.getLinks(data.getTransaction.entry_links)}

                    {this.renderSignButton(entry_address, data)}

                </Content>
            </CardContainer>
        </Card> 

        )
    }

    renderTransaction = (entry_address: string, index: number) => {
        const {transactionsList} = this.state;
        const transaction: GetTransaction = transactionsList.get(entry_address);
        if(transaction && !transaction.getTransaction.executed) {
            return (
                <Col key={index}>
                    {
                        this.renderContent(transaction, entry_address)
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
                                        return this.renderTransaction(entry_address, index)   
                                    
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