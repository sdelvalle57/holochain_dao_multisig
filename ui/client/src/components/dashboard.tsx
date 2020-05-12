import React, { Fragment, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import styled from 'react-emotion';
import { RouteComponentProps } from '@reach/router';

import { AppData } from '../__generated__/AppData';

import {Container} from './global-containers';
import {Card, Loading, Error, Modal, Info} from '.'

import InfoIcon from '../assets/images/infoIcon.png'
import AddMemberIcon from '../assets/images/addIcon.png'
import RemoveIcon from '../assets/images/removeIcon.png'
import FunctionsIcon from '../assets/images/functionsIcon.png'
import PendingTxIcon from '../assets/images/pendingTxIcon.png'
import ApprovedTxIcon from '../assets/images/approvedTxIcon.png'

import {GET_MY_ADDRESS, GET_MULTISIG_MEMBERS, GET_MASTER_MULTISIG_ADDRESS} from '../queries';
import { VIEW_WALLET_INFO, ADD_NEW_MEMBER, REMOVE_MEMBER, CHANGE_REQUIREMENTS, PENDING_TRASACTIONS, APPROVED_TRANSACTIONS } from '../common/constants';
import { MasterMultisigAddress } from '../__generated__/MasterMultisigAddress';
import { GetMultisigMembers, GetMultisigMembersVariables } from '../__generated__/GetMultisigMembers';


interface ModalContent {
  headerTitle: string;
  header: string;
  bodyContent: any
}

interface DashboardProps extends RouteComponentProps {
}

const Dashboard: React.FC<DashboardProps> = () => {

  const [show, setShow] = useState(false);
  const modalInitalState = {
    headerTitle: "",
    header: "",
    bodyContent: ""
  }
  const [modalContent, setModalContent] = useState(modalInitalState as ModalContent);


  const onCardClick = (cardName: string) => {
    if(cardName === VIEW_WALLET_INFO) {
      // const membersContent = members?.length > 0 ? 
      setModalContent({
        headerTitle: "ADN",
        header: multisigAddress.data?.getMultisigAddress?.entry || "",
        bodyContent: <Info members={members} />
      })
      setShow(true)
    }
  }

  const appData = useQuery<AppData>(GET_MY_ADDRESS);
  if (appData.loading) return <Loading />;
  if (appData.error) return <Error error={appData.error} />;

  let members: GetMultisigMembers;

  const multisigAddress = useQuery<MasterMultisigAddress>(GET_MASTER_MULTISIG_ADDRESS, {
    
    onCompleted: data => {
      constmembers = useQuery<GetMultisigMembers, GetMultisigMembersVariables>(
        GET_MULTISIG_MEMBERS,
        {
          variables:{
            multisig_address: data.getMultisigAddress.entry
          }
        }
      );
      if (multisigAddress.loading || members.loading) return <Loading />;
      if (members.error) return <Error error={members.error} />;
    },
    onError: error => {
      return <Error error={error} />;
    }
    
  });
  

  

  //const enabled = appData.data?.isMember || false
  const enabled = true;

  return (
    <Fragment>
        <Container>
          <CardContainer>
            <Card onClick={() => onCardClick(VIEW_WALLET_INFO)} image={InfoIcon} title={VIEW_WALLET_INFO} enabled={enabled} />
            <Card onClick={() => onCardClick(ADD_NEW_MEMBER)} image={AddMemberIcon} title={ADD_NEW_MEMBER} enabled={enabled} />
            <Card onClick={() => onCardClick(REMOVE_MEMBER)} image={RemoveIcon} title={REMOVE_MEMBER} enabled={enabled} />
            <Card onClick={() => onCardClick(CHANGE_REQUIREMENTS)} image={FunctionsIcon} title={CHANGE_REQUIREMENTS} enabled={enabled} />
            <Card onClick={() => onCardClick(PENDING_TRASACTIONS)} image={PendingTxIcon} title={PENDING_TRASACTIONS} enabled={enabled} />
            <Card onClick={() => onCardClick(APPROVED_TRANSACTIONS)} image={ApprovedTxIcon} title={APPROVED_TRANSACTIONS} enabled={enabled} />
          </CardContainer>
        </Container>
        <Modal onClose={() => setShow(false)} content={modalContent} show={show} />
      </Fragment>
  )
}

export default Dashboard;


const CardContainer = styled('div')({
  marginBottom:' 2.5em',
  display: 'inline-flex',
});