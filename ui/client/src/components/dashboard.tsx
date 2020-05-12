import React, { Fragment, Component } from 'react';
import styled from 'react-emotion';

import {withApollo, WithApolloClient} from 'react-apollo';

import { GetMultisig, GetMultisigVariables, GetMultisig_getMultisig } from '../__generated__/GetMultisig';
import { MasterMultisigAddress } from '../__generated__/MasterMultisigAddress';
import { GetMultisigMembers, GetMultisigMembersVariables, GetMultisigMembers_getMembers } from '../__generated__/GetMultisigMembers';

import {Container} from './global-containers';
import {Card, Alert, Error, Modal, Info} from '.'

import InfoIcon from '../assets/images/infoIcon.png'
import AddMemberIcon from '../assets/images/addIcon.png'
import RemoveIcon from '../assets/images/removeIcon.png'
import FunctionsIcon from '../assets/images/functionsIcon.png'
import PendingTxIcon from '../assets/images/pendingTxIcon.png'
import ApprovedTxIcon from '../assets/images/approvedTxIcon.png'

import {GET_MULTISIG_MEMBERS, GET_MASTER_MULTISIG_ADDRESS, GET_MULTISIG} from '../queries';
import { VIEW_WALLET_INFO, ADD_NEW_MEMBER, REMOVE_MEMBER, CHANGE_REQUIREMENTS, PENDING_TRASACTIONS, APPROVED_TRANSACTIONS } from '../common/constants';

import {Type} from './alert';

interface ModalProps {
  headerTitle: Object | undefined;
  header: String;
  content: any;
  show: boolean;
  loading: boolean;
}

class StartMultisigForm extends Component<WithApolloClient<{}>, ModalProps> {

  state = {
    headerTitle: undefined,
    header: "",
    content: "",
    show: false,
    showError: false,
    loading: false
  }

  getMultisigAddress = async (): Promise<string> => {
    const { client } = this.props;
    const multisigAddress = await client.query<MasterMultisigAddress>({
      query: GET_MASTER_MULTISIG_ADDRESS
    })
    return multisigAddress.data.getMultisigAddress.entry;
  }

  getMultisigData = async (multisigAddress: string): Promise<GetMultisig_getMultisig> => {
    const { client } = this.props;
    const multisigData = await client.query<GetMultisig, GetMultisigVariables>({
      query: GET_MULTISIG,
      variables: { multisig_address: multisigAddress}
    })
    return multisigData.data.getMultisig
  }

  getMembers = async (multisigAddress: string): Promise<GetMultisigMembers_getMembers[]> => {
    const { client } = this.props;
    const members = await client.query<GetMultisigMembers, GetMultisigMembersVariables>({
      query: GET_MULTISIG_MEMBERS,
      variables: { multisig_address: multisigAddress }
    })
    return members.data.getMembers
  }

  fetchMultisigData = async () => {
    try { 
      const multisigAddress = await this.getMultisigAddress();

      if(multisigAddress) {
        const multisigData = await this.getMultisigData(multisigAddress);

        if(multisigData) {
          const members = await this.getMembers(multisigAddress);

          if(members.length > 0) {
            const info = <Info members={members} multisigData={multisigData}/>
            this.setState({
              header: multisigAddress,
              headerTitle: "Multisig",
              show: true, 
              content: info})
            return;
          }
        }
      }
      const error = <Alert text="Internal Error" type={Type.Danger} />
      this.setState({show: true, content: error, header: "Error"})
     
    } catch (err) { 
      const error = <Error error={err} />
      this.setState({show: true, content: error, header: "Error"})
    } 
  }


  onCardClick =  async(cardName: string) => {
    
    
  }

  onHide = () => {
    this.setState({
      header: "",
      headerTitle: undefined,
      content: "",
      show: false,
    })
  }

  //const enabled = appData.data?.isMember || false

  render() {
  const enabled = true;
  const {content, header, headerTitle, show, loading} = this.state;

    return (
    <Fragment>
        <Container>
          <CardContainer>
            {/* TODO: Add loading to cards when onCLick */}
            <Card onClick={() => this.fetchMultisigData()} image={InfoIcon} title={VIEW_WALLET_INFO} enabled={enabled} />
            <Card onClick={() => this.onCardClick(ADD_NEW_MEMBER)} image={AddMemberIcon} title={ADD_NEW_MEMBER} enabled={enabled} />
            <Card onClick={() => this.onCardClick(REMOVE_MEMBER)} image={RemoveIcon} title={REMOVE_MEMBER} enabled={enabled} />
            <Card onClick={() => this.onCardClick(CHANGE_REQUIREMENTS)} image={FunctionsIcon} title={CHANGE_REQUIREMENTS} enabled={enabled} />
            <Card onClick={() => this.onCardClick(PENDING_TRASACTIONS)} image={PendingTxIcon} title={PENDING_TRASACTIONS} enabled={enabled} />
            <Card onClick={() => this.onCardClick(APPROVED_TRANSACTIONS)} image={ApprovedTxIcon} title={APPROVED_TRANSACTIONS} enabled={enabled} />
          </CardContainer>
        </Container>
        <Modal 
          header={header}
          headerTitle={headerTitle}
          onClose={() => this.onHide()} 
          content={content} 
          show={show} />
      </Fragment>
  )
  }
  
}

export default withApollo(StartMultisigForm);


const CardContainer = styled('div')({
  marginBottom:' 2.5em',
  display: 'inline-flex',
});