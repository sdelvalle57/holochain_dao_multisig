import React,  { Component } from 'react';
import { useQuery, WithApolloClient } from 'react-apollo';
import { GetTransactionList, GetTransactionListVariables } from '../../__generated__/GetTransactionList';
import { GET_TRANSACTIONS, GET_TRANSACTION } from '../../queries';
import Loading from '../loading';
import Error from '../error';
import Alert, { Type } from '../alert';
import { GetTransaction, GetTransactionVariables, GetTransaction_getTransaction } from '../../__generated__/GetTransaction';
import { useLazyQuery } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';

interface PageProps {
    multisigAddress: string;
}

// const RemoveMemberFC: React.FC<PageProps> = (props) => {
//     const { multisigAddress } = props;
    
//     const {loading, error, data} = useQuery<GetTransactionList, GetTransactionListVariables>(GET_TRANSACTIONS,{
//         variables: {
//             multisig_address: multisigAddress
//         },
//         onCompleted
//     });

//     const [getTransaction] = useLazyQuery<GetTransaction, GetTransactionVariables>(GET_TRANSACTION)
    
//     if(loading) return <Loading />
//     if(error) return <Error error={error} />

//     if(!data?.getTransactionList || data.getTransactionList.length === 0) {
//         return <Alert type={Type.Warning} text="There are no transactions to show" />;
//     }

//     const txs = data.getTransactionList.map( tx => {
//         if(tx) {
//             const transactionData = getTransaction({
//                 variables: {
//                     entry_address: tx,
//                     multisig_address: multisigAddress
//                 }
//             })
//         }
//     })

//     console.log(txs)

//     return <div></div>

//     // const transactions = data.getTransactionList;
//     // return <PendingTxs 
//     //         transactions = { transactions }
//     //         multisigAddress={multisigAddress} />
// }

// export default RemoveMemberFC;

interface PageProps extends WithApolloClient<{}> {
    multisigAddress: string;
}

interface StateProps {
    loading: boolean,
    error: ApolloError | undefined,
    transactionList: GetTransaction_getTransaction[]
}

export default class PendingTxs extends Component<PageProps, StateProps> {

    state = {
        loading: true,
        error: undefined,
        transactionList: []
    }

    componentDidMount = async () => {
        const { client, multisigAddress } = this.props;
        const { transactionList } = this.state;
        try {
            const transactions = await client.query<GetTransactionList, GetTransactionListVariables>({
                query: GET_TRANSACTIONS,
                variables: {
                    multisig_address: multisigAddress
                }
            })
            if(transactions.data.getTransactionList.length > 0) {
                transactions.data.getTransactionList.map( async tx => {
                    if(tx) {
                        const transactionData = await client.query<GetTransaction, GetTransactionVariables>({
                            query: GET_TRANSACTION,
                            variables: {
                                entry_address: tx,
                                multisig_address: multisigAddress
                            }
                        })
                        this.setState({
                            transactionList: [...transactionList, transactionData.data.getTransaction]
                        })
                        
                        
                    }
                })
                            
            }
        } catch (error) {
            this.setState({error})
        }
        
        
        this.setState({ loading: false })
    }
    
    render() {
        const { loading, transactionList } = this.state;
        if(loading) return <Loading />
        return (
            <div>
                {
                    transactionList.map((tx: GetTransaction_getTransaction, index) => {
                        return <div key={index}>{tx.title}</div>

                    })
                }
            </div>
        )
        
        
    }
}