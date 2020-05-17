import React, { Component } from 'react';
import styled from 'react-emotion';

import {Button} from '.';
import { StyledForm, StyledInput} from './global-containers'
import { unit } from '../styles';
import { useMutation } from 'react-apollo';
import { CHANGE_REQUIREMENT } from '../mutations';
import Loading from './loading';
import Error from './error';
import Alert, { Type } from './alert';
import { ChangeRequirement, ChangeRequirementVariables } from '../__generated__/ChangeRequirement';

interface MainProps {
    multisigAddress: string;
    current: number;
}

const ChangeReq: React.FC<MainProps> = (props) => {
    const { multisigAddress, current } = props;

    const [
        changeRequirement, 
        {loading, error, data}
    ] = useMutation<ChangeRequirement, ChangeRequirementVariables>(CHANGE_REQUIREMENT);

    if(loading) return <Loading />
    if(error) return <Error error={error} />
    if(data?.changeRequirement.entry) {
        const responseObject = <><div>Entry</div><div>{data.changeRequirement.entry}</div></> 
        return <Alert text={responseObject} type={Type.Success} />;
    }
    return (
        <ChangeRequirementForm 
            changeRequirement={changeRequirement} 
            current={current}
            multisig={multisigAddress} />
    )
}

export default ChangeReq;


/******* Form *********/

interface ChangeRequirementFormProps {
    changeRequirement: (a : {variables: ChangeRequirementVariables}) => void;
    multisig: string;
    current: number;
}

interface ChangeRequirementFormState {
    description: string;
    new_requirement: number;
}

class ChangeRequirementForm extends Component<ChangeRequirementFormProps, ChangeRequirementFormState> {
  state = { 
    description: "",
    new_requirement: this.props.current, 
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = (event.target as HTMLInputElement).name ;
    const value = (event.target as HTMLInputElement).value;
   
    this.setState(s => ({ 
        ...this.state, 
        [name]: value 
    } as Pick<ChangeRequirementFormState, keyof ChangeRequirementFormState>));
  };

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { description, new_requirement } = this.state;
    this.props.changeRequirement({ 
        variables : {
            description,
            new_requirement,
            multisig_address: this.props.multisig
        }
    });
  };

  renderForm = () => {
    return (
      <StyledForm onSubmit={(e) => this.onSubmit(e)}>
        <StyledInput
          required
          name="description"
          placeholder="Description"
          onChange={(e) => this.onChange(e)} />
        <StyledInput
          required
          name="new_requirement"
          type="number"
          value={this.state.new_requirement}
          placeholder="New Requirement"
          onChange={(e) => this.setState({new_requirement: parseInt(e.target.value)})} />
        <Button type="submit">Submit</Button>
      </StyledForm>
    )
  }

  render() {
    return (
      <Container>
          <WalletInfo>
                <Row>
                    <ColTitle>Current Required: </ColTitle>
                    <ColValue>{this.props.current}</ColValue>
                </Row>
            </WalletInfo>
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

const WalletInfo = styled('div')({
    textAlign: 'center',
    marginTop: '3em',
    width: '60%',
})

const Row = styled('div')({
    marginBottom: '15px',
    display: 'flex',
    flexWrap: 'wrap',
    marginRight: '-15px',
    marginLeft: '-15px',
})

const Col = styled('div')({
    fontWeight: 800,
    fontSize: '12px',
    lineHeight: '19px',
    position: 'relative',
    width: '100%',
    paddingRight: '15px',
    paddingLeft: '15px',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const ColTitle = styled(Col)({
    color: '#C49E57',
    textAlign: 'end',
    flex: '0 0 33.333333%',
    maxWidth: '33.333333%',
})

const ColValue = styled(Col)({
    color: '#000000',
    textAlign: 'start',
    flex:' 0 0 66.666667%',
    maxWidth: '66.666667%',
})