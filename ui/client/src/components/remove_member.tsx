import React, { Component } from 'react';
import styled from 'react-emotion';

import {Button} from '.';
import { StyledForm, StyledInput} from './global-containers'
import { unit } from '../styles';
import { AddMemberVariables, AddMember } from '../__generated__/AddMember';
import { useMutation } from 'react-apollo';
import { START_MULTISIG, ADD_MEMBER } from '../mutations';
import Loading from './loading';
import Error from './error';
import Alert, { Type } from './alert';

interface MainProps {
    multisigAddress: string;
}


//TODO; implement in rust
const RemoveMember: React.FC<MainProps> = (props) => {
    const { multisigAddress } = props;
    const [addNewMember, {loading, error, data}] = useMutation<AddMember, AddMemberVariables>(ADD_MEMBER);
    if(loading) return <Loading />
    if(error) return <Error error={error} />
    if(data?.addMember.entry) {
        const responseObject = <><div>Entry</div><div>{data.addMember.entry}</div></> 
        return <Alert text={responseObject} type={Type.Success} />;
    }
    return <AddNewMemberForm addNewMember={addNewMember} multisig={multisigAddress} />
}

export default RemoveMember;


/******* Form *********/

interface AddNewMemberFormProps {
    addNewMember: (a : {variables: AddMemberVariables}) => void;
    multisig: string;
}

interface AddNewMemberFormState {
  name: string;
  address: string;
}

class AddNewMemberForm extends Component<AddNewMemberFormProps, AddNewMemberFormState> {
  state = { 
    name: '', 
    description: '',
    address: ''
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = (event.target as HTMLInputElement).name ;
    const value = (event.target as HTMLInputElement).value;
   
    this.setState(s => ({ 
        ...this.state, 
        [name]: value 
    } as Pick<AddNewMemberFormState, keyof AddNewMemberFormState>));
  };

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {name, description, address} = this.state;
    this.props.addNewMember({ 
        variables : {
            name,
            description,
            address,
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
          name="address"
          placeholder="Address"
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