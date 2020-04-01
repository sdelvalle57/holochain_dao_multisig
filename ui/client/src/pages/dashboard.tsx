import React, { Fragment, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import styled from 'react-emotion';
import { RouteComponentProps } from '@reach/router';

import { AppData } from '../__generated__/AppData';
import { Members } from '../__generated__/Members';

import {Container} from '../components/global-containers';
import {Card, Loading, Error, Modal, Info} from '../components'

import InfoIcon from '../assets/images/infoIcon.png'
import AddMemberIcon from '../assets/images/addIcon.png'
import RemoveIcon from '../assets/images/removeIcon.png'
import FunctionsIcon from '../assets/images/functionsIcon.png'
import PendingTxIcon from '../assets/images/pendingTxIcon.png'
import ApprovedTxIcon from '../assets/images/approvedTxIcon.png'

import {GET_MY_ADDRESS_AND_MEMBERSHIP, GET_MEMBERS} from '../queries';
import { VIEW_WALLET_INFO, ADD_NEW_MEMBER, REMOVE_MEMBER, CHANGE_REQUIREMENTS, PENDING_TRASACTIONS, APPROVED_TRANSACTIONS } from '../common/constants';


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
        header: membership.data?.dnaAddress || "",
        bodyContent: <Info members={members.data} />
      })
      setShow(true)
    }
  }

  const membership = useQuery<AppData>(GET_MY_ADDRESS_AND_MEMBERSHIP);
  const members = useQuery<Members>(GET_MEMBERS);

  if (membership.loading) return <Loading />;
  if (membership.error) return <Error error={membership.error} />;

  return (
    <Fragment>
        <Container>
          <CardContainer>
            <Card onClick={() => onCardClick(VIEW_WALLET_INFO)} image={InfoIcon} title={VIEW_WALLET_INFO} enabled={membership.data?.isMember || false} />
            <Card onClick={() => onCardClick(ADD_NEW_MEMBER)} image={AddMemberIcon} title={ADD_NEW_MEMBER} enabled={membership.data?.isMember || false} />
            <Card onClick={() => onCardClick(REMOVE_MEMBER)} image={RemoveIcon} title={REMOVE_MEMBER} enabled={membership.data?.isMember || false} />
            <Card onClick={() => onCardClick(CHANGE_REQUIREMENTS)} image={FunctionsIcon} title={CHANGE_REQUIREMENTS} enabled={membership.data?.isMember || false} />
            <Card onClick={() => onCardClick(PENDING_TRASACTIONS)} image={PendingTxIcon} title={PENDING_TRASACTIONS} enabled={membership.data?.isMember || false} />
            <Card onClick={() => onCardClick(APPROVED_TRANSACTIONS)} image={ApprovedTxIcon} title={APPROVED_TRANSACTIONS} enabled={membership.data?.isMember || false} />
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