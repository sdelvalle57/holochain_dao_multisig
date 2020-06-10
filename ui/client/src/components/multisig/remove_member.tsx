import React, { Component } from 'react';
import styled from 'react-emotion';

import { StyledForm, StyledInput, StyledSelector} from '../global-containers';
import { unit } from '../../styles';
import { useMutation, Query } from 'react-apollo';
import { REMOVE_MEMBER } from '../../mutations';
import { Loading, Error, Button } from '../index';
import Alert, { Type } from '../alert';
import { RemoveMember, RemoveMemberVariables } from '../../__generated__/RemoveMember';
import { GetMultisigMembers } from '../../__generated__/GetMultisigMembers';
import { GetMember, GetMemberVariables } from '../../__generated__/GetMember';
import { GET_MEMBER } from '../../queries';

interface MainProps {
    multisigAddress: string;
    members: GetMultisigMembers;
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

interface RemoveMemberProps {
    removeMember: (a : {variables: RemoveMemberVariables}) => void;
    multisig: string;
    members: GetMultisigMembers;
}

interface RemoveMemberFormState {
  description: string;
  address: string;
}

class RemoveMemberForm extends Component<RemoveMemberProps, RemoveMemberFormState> {
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
    } as Pick<RemoveMemberFormState, keyof RemoveMemberFormState>));
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
            members.getMembers.map((m, index) => {
              return (
                <Query<GetMember, GetMemberVariables> 
                query = { GET_MEMBER } 
                variables = {{
                  entry_address: m,
                  multisig_address: this.props.multisig
                }}>
                  {({data, error, loading}) => {
                        if(error) return <option key={index} value={m}>{m}</option>;
                        if(loading) return <option key={index} value={m}>{m}</option>;
                        return <option key={index} value={m}>{data?.getMember?.member.name}</option>;
                    }}
                </Query>
              )
              
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
