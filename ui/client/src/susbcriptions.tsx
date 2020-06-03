import gql from 'graphql-tag';


/*******Subscriptions */
export const PENDING_TX_ADDED = gql`
    subscription OnPendinTxAdded($multisig_address: String!) {
        pendingTxAdded(multisig_address: $multisig_address) 
    }
`