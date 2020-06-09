import React, { Fragment, Component } from 'react';
import styled from 'react-emotion';

import { WithApolloClient} from 'react-apollo';

import { GetMultisig, GetMultisigVariables, GetMultisig_getMultisig } from '../__generated__/GetMultisig';
import { GetMultisigMembers, GetMultisigMembersVariables, GetMultisigMembers_getMembers } from '../__generated__/GetMultisigMembers';

import {Container} from './global-containers';
import {Card, Alert, Error, Modal, Info } from '.'
import { 
  AddMemberForm, 
  ChangeRequirementForm, 
  RemoveMemberForm, 
  CreateOrganizationForm,
} from './multisig'

import InfoIcon from '../assets/images/infoIcon.png'
import AddMemberIcon from '../assets/images/addIcon.png'
import RemoveIcon from '../assets/images/removeIcon.png'
import FunctionsIcon from '../assets/images/functionsIcon.png'
import PendingTxIcon from '../assets/images/pendingTxIcon.png'
import ApprovedTxIcon from '../assets/images/approvedTxIcon.png'
import CreateOrganizationIcon from '../assets/images/createOrganizationIcon.png'
import ViewCompaniesIcon from '../assets/images/viewCompaniesIcon.png'

import {GET_MULTISIG_MEMBERS, GET_MULTISIG, GET_ORGANIZATIONS} from '../queries';
import { GET_MULTISIG_INFO, VIEW_WALLET_INFO, ADD_NEW_MEMBER, REMOVE_MEMBER, 
  CHANGE_REQUIREMENTS, PENDING_TRASACTIONS, APPROVED_TRANSACTIONS, 
  CREATE_ORGANIZATION, VIEW_ORGANIZATIONS } from '../common/constants';

import {Type} from './alert';
import { navigate } from '@reach/router';
import { GetOrganizations, GetOrganizationsVariables } from '../__generated__/GetOrganizations';

interface PageProps extends WithApolloClient<{}> {
  multisigAddress: string | null;
}

interface ModalProps {
  headerTitle: Object | undefined;
  header: String;
  content: any;
  show: boolean;
  loading: boolean;
}

class StartMultisigForm extends Component<PageProps, ModalProps> {

  state = {
    headerTitle: undefined,
    header: "",
    content: "",
    show: false,
    showError: false,
    loading: false
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

  getOrganizations = async (multisigAddress: string): Promise<(string | null)[]> => {
    const { client } = this.props;
    const organizations = await client.query<GetOrganizations, GetOrganizationsVariables>({
      query: GET_ORGANIZATIONS,
      variables: { multisig_address: multisigAddress}
    })
    return organizations.data.getOrganizations
  }

  fetchMultisigData = async () => {
    const { multisigAddress } = this.props;
    try { 

      if(multisigAddress) {
        const multisigData = await this.getMultisigData(multisigAddress);

        if(multisigData) {
          const members = await this.getMembers(multisigAddress);

          const organizations = await this.getOrganizations(multisigAddress)

          if(members.length > 0 && organizations) {
            const info = <Info members={members} multisigData={multisigData} organizations={organizations}/>
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

  addNewMember = () => {
    const { multisigAddress } = this.props;
      if(multisigAddress) {
        const content = <AddMemberForm multisigAddress={multisigAddress} />
        this.setState({ 
          header: multisigAddress, 
          headerTitle: "Add Member",
          content,
          show: true
        });
        return;
      }
      const error = <Alert text="Internal Error" type={Type.Danger} />
      this.setState({show: true, content: error, header: "Error"})
  }

  removeMember = async () => {
    const { multisigAddress } = this.props;
    if(multisigAddress) {
      const multisigData = await this.getMultisigData(multisigAddress);
      if(multisigData) {
        const members = await this.getMembers(multisigAddress);
        const content = <RemoveMemberForm members= {members} multisigAddress={multisigAddress} />
        this.setState({ 
          header: multisigAddress, 
          headerTitle: "Remove Member",
          content,
          show: true
        });
        return;
      }
      
    }
    const error = <Alert text="Internal Error" type={Type.Danger} />
    this.setState({show: true, content: error, header: "Error"})
  }

  pendingTxs = async () => {
    const { multisigAddress } = this.props;
    navigate(`/pending_transactions/${multisigAddress}`)
  }

  approvedTxs = async () => {
    const { multisigAddress } = this.props;
    navigate(`/approved_transactions/${multisigAddress}`)
  }

  changeRequirement = async () => {
    const { multisigAddress } = this.props;
    try { 

      if(multisigAddress) {
        const multisigData = await this.getMultisigData(multisigAddress);

        if(multisigData) {
          const content = (
            <ChangeRequirementForm 
              multisigAddress={multisigAddress} 
              current={multisigData.required} />
          )
          this.setState({
            show: true,
            content,
            header: multisigAddress,
            headerTitle: "Change Requirement"
          })
          return;
        }
      }
      const error = <Alert text="Internal Error" type={Type.Danger} />
      this.setState({show: true, content: error, header: "Error"})
     
    } catch (err) { 
      const error = <Error error={err} />
      this.setState({show: true, content: error, header: "Error"})
    } 
  }

  createOrganization = async () => {
    const { multisigAddress } = this.props;
      if(multisigAddress) {
        const content = <CreateOrganizationForm multisigAddress={multisigAddress} />
        this.setState({ 
          header: multisigAddress, 
          headerTitle: "New Organization",
          content,
          show: true
        });
        return;
      }
      const error = <Alert text="Internal Error" type={Type.Danger} />
      this.setState({show: true, content: error, header: "Error"})
  }

  viewOrganizations = async () => {
    const { multisigAddress } = this.props;
    navigate(`/organizations/${multisigAddress}`)
    // const { multisigAddress } = this.props;
    //   if(multisigAddress) {
    //     const organizations = await this.getOrganizations(multisigAddress);
    //     if(organizations && organizations.length > 0) {
    //       const content = <ViewOrganizations multisigAddress={multisigAddress} organizations = {organizations} />
    //       this.setState({ 
    //         header: multisigAddress, 
    //         headerTitle: "Organizations",
    //         content,
    //         show: true
    //       });
    //       return;
    //     } else {
    //       const info = <Alert text="There are no organizations" type={Type.Info} />
    //       this.setState({show: true, content: info, header: "Organizations"})
    //       return;
    //     }
    //   }
    //   const error = <Alert text="Internal Error" type={Type.Danger} />
    //   this.setState({show: true, content: error, header: "Error"})
  }

  onCardClick =  async(cardName: string) => {
    switch(cardName) {
      case GET_MULTISIG_INFO:
        this.fetchMultisigData();
        break;
      case ADD_NEW_MEMBER:
        this.addNewMember();
        break;
      case REMOVE_MEMBER:
        this.removeMember();
        break
      case CHANGE_REQUIREMENTS:
        this.changeRequirement();
        break;
      case PENDING_TRASACTIONS:
        this.pendingTxs();
        break;
      case APPROVED_TRANSACTIONS:
          this.approvedTxs();
          break;
      case CREATE_ORGANIZATION:
        this.createOrganization();
        break
      case VIEW_ORGANIZATIONS:
        this.viewOrganizations();
        break
    }
  }

  onHide = () => {
    this.setState({
      header: "",
      headerTitle: undefined,
      content: "",
      show: false,
    })
  }

  render() {
  const enabled = true;
  const {content, header, headerTitle, show} = this.state;

    return (
    <Fragment>
        <Container>
          <CardContainer>
            {/* TODO: Add loading to cards when onCLick */}
            <Card onClick={() => this.onCardClick(GET_MULTISIG_INFO)} image={InfoIcon} title={VIEW_WALLET_INFO} enabled={enabled} />
            <Card onClick={() => this.onCardClick(ADD_NEW_MEMBER)} image={AddMemberIcon} title={ADD_NEW_MEMBER} enabled={enabled} />
            <Card onClick={() => this.onCardClick(REMOVE_MEMBER)} image={RemoveIcon} title={REMOVE_MEMBER} enabled={enabled} />
            <Card onClick={() => this.onCardClick(CHANGE_REQUIREMENTS)} image={FunctionsIcon} title={CHANGE_REQUIREMENTS} enabled={enabled} />
            <Card onClick={() => this.onCardClick(CREATE_ORGANIZATION)} image={CreateOrganizationIcon} title={CREATE_ORGANIZATION} enabled={enabled} />
            <Card onClick={() => this.onCardClick(PENDING_TRASACTIONS)} image={PendingTxIcon} title={PENDING_TRASACTIONS} enabled={enabled} />
            <Card onClick={() => this.onCardClick(APPROVED_TRANSACTIONS)} image={ApprovedTxIcon} title={APPROVED_TRANSACTIONS} enabled={enabled} />
          </CardContainer>
          <CardContainer>
            <Card onClick={() => this.onCardClick(VIEW_ORGANIZATIONS)} image={ViewCompaniesIcon} title={VIEW_ORGANIZATIONS} enabled={enabled} />
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

export default StartMultisigForm;


const CardContainer = styled('div')({
  marginBottom:' 2.5em',
  display: 'inline-flex',
  width: "100%"
});