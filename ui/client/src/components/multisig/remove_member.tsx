import React, { Component } from 'react';
import styled from 'react-emotion';

import { StyledForm, StyledInput, StyledSelector} from '../global-containers'
import { unit } from '../../styles';
import { useMutation } from 'react-apollo';
import { REMOVE_MEMBER } from '../../mutations';
import { Loading, Error, Button } from '../index';
import Alert, { Type } from '../alert';
import { RemoveMember, RemoveMemberVariables } from '../../__generated__/RemoveMember';
import { GetMultisigMembers_getMembers } from '../../__generated__/GetMultisigMembers';

interface MainProps {
    multisigAddress: string;
    members: GetMultisigMembers_getMembers[];
}

const RemoveMemberFC: React.FC<MainProps> = (props) => {
    const { multisigAddress, members } = props;
    const [removeMember, {loading, error, data}] = useMutation<RemoveMember, RemoveMemberVariables>(REMOVE_MEMBER);
    if(loading) return <Loading />
    if(error) return <Error error={error} />
    if(data?.removeMember.entry) {
        const responseObject = <><div>Entry</div><div>{data.removeMember.entry}</div></> 
        return <Alert text={responseObject} type={Type.Success} />;
    }
    return <RemoveMemberForm removeMember={removeMember} members={members} multisig={multisigAddress} />
}

export default RemoveMemberFC;


/******* Form *********/

interface AddNewMemberFormProps {
    removeMember: (a : {variables: RemoveMemberVariables}) => void;
    multisig: string;
    members: GetMultisigMembers_getMembers[];
}

interface AddNewMemberFormState {
  description: string;
  address: string;
}

class RemoveMemberForm extends Component<AddNewMemberFormProps, AddNewMemberFormState> {
  state = { 
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
    const { description, address } = this.state;
    this.props.removeMember({ 
        variables : {
            description,
            address,
            multisig_address: this.props.multisig
        }
    });
  };

  renderForm = () => {
    const { members } = this.props;
    return (
      <StyledForm onSubmit={(e) => this.onSubmit(e)}>
        <StyledInput
          required
          name="description"
          placeholder="Description"
          onChange={(e) => this.onChange(e)} />
        <StyledSelector
          required
          onSelect={(e)=> console.log(e.target)}
          onChange={({target}) => {console.log(target.value); this.setState({address: target.value})}}
          name="address">
          <option key="selection" value="">Please select</option>
          {
            members.map((m, index) => {
              return <option key={index} value={m.member.address}>{m.member.name}</option>
            })
          }
        </StyledSelector>
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
