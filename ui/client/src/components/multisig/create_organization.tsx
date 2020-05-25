import React, { Component } from 'react';
import styled from 'react-emotion';

import { StyledForm, StyledInput} from '../global-containers'
import { unit } from '../../styles';
import { AddMemberVariables, AddMember } from '../../__generated__/AddMember';
import { useMutation } from 'react-apollo';
import { ADD_MEMBER } from '../../mutations';
import {Loading, Error, Button} from '../index';
import Alert, { Type } from '../alert';
import { NewOrganization, NewOrganizationVariables } from '../../__generated__/NewOrganization';

interface MainProps {
    multisigAddress: string;
}

const CreateOrganization: React.FC<MainProps> = (props) => {
    const { multisigAddress } = props;
    const [newOrganization, {loading, error, data}] = useMutation<NewOrganization, NewOrganizationVariables>(ADD_MEMBER);
    if(loading) return <Loading />
    if(error) return <Error error={error} />
    if(data?.newOrganization) {
        const responseObject = <><div>Entry</div><div>{data.newOrganization}</div></> 
        return <Alert text={responseObject} type={Type.Success} />;
    }
    return <AddNewMemberForm newOrganization={newOrganization} multisig={multisigAddress} />
}

export default CreateOrganization;


/******* Form *********/

interface CreateOrganizationProps {
    newOrganization: (a : {variables: NewOrganizationVariables}) => void;
    multisig: string;
}

interface CreateOrganizationFormState {
  name: string;
  description: string;
  owner: string;
}

class AddNewMemberForm extends Component<CreateOrganizationProps, CreateOrganizationFormState> {
  state = { 
    name: '', 
    description: '',
    owner: ''
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = (event.target as HTMLInputElement).name ;
    const value = (event.target as HTMLInputElement).value;
   
    this.setState(s => ({ 
        ...this.state, 
        [name]: value 
    } as Pick<CreateOrganizationFormState, keyof CreateOrganizationFormState>));
  };

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {name, description, owner} = this.state;
    this.props.newOrganization({ 
        variables : {
            name,
            description,
            owner,
            multisig_address: this.props.multisig
        }
    });
  };

  renderForm = () => {
    return (
      <StyledForm onSubmit={(e) => this.onSubmit(e)}>
        <StyledInput
          required
          name="name"
          placeholder="Name"
          onChange={(e) => this.onChange(e)}  />
        <StyledInput
          required
          name="description"
          placeholder="Description"
          onChange={(e) => this.onChange(e)} />
        <StyledInput
          required
          name="owner"
          placeholder="Owner"
          onChange={(e) => this.onChange(e)} />
        <Button type="submit">Submit</Button>
      </StyledForm>
    )
  }

  render() {
    return (
      <Container>
        {this.renderForm()}
      </Container>
    );
  }
}

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexGrow: 1,
  paddingBottom: unit * 6,
  color: 'white',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '38em'
});