import React, { Fragment, Component } from 'react';
import styled from 'react-emotion';
import { useMutation } from '@apollo/react-hooks';

import {Container, InnerContainer} from './global-containers';
import {Button, Loading, Error} from '.';
import { START_MULTISIG } from '../mutations';
import { Start } from '../__generated__/Start';

interface StartMultisigProps {
  setMultisig: (multisigAddress: string) => void
} 

const StartMultisig: React.FC<StartMultisigProps> = (props) => {
  const [start, {loading, error}] = useMutation<Start>(START_MULTISIG, {
    onCompleted: (data) => {
      props.setMultisig(data.start.entry);
    }
  });
  if(loading) return <Loading />
  if(error) return <Error error={error} />
  return <StartButton start={start}/>;

}

export default StartMultisig;


/******* Form *********/

interface Startprops {
  start: () => void
}

class StartButton extends Component<Startprops> {

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.start()
  };

  renderContent = () => {
    return (
      <StyledForm onSubmit={(e) => this.onSubmit(e)}>
        <Button type="submit">Start Multisig</Button>
      </StyledForm>
    )
  }

  render() {
    return (
      <Fragment>
        <Container>
          <InnerContainer>
            { this.renderContent() }
          </InnerContainer>
        </Container>
      </Fragment>
    )
  }
}

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: 406,
  padding: 8 * 3.5,
  borderRadius: 3,
  color: "#343c5a",
  backgroundColor: 'white',
  margin: "auto"
});
