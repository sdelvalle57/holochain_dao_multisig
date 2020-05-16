import React from 'react';
import styled from 'react-emotion';

import { colors } from '../styles';
import { InnerContainer } from './global-containers';


export enum Type {
    Primary,
    Secondary,
    Success,
    Danger,
    Warning,
    Info,
    Light,
    Dark
}

export interface AlertProps {
    type: Type,
    text: string,
}


const Alert: React.FC<AlertProps> = ({ type, text }) => {
    let Alert = Primary;
    switch (type) {
        case Type.Primary:
            Alert = Primary;
            break;
        case Type.Secondary:
            Alert = Secondary;
            break;
        case Type.Success:
            Alert = Success;
            break;
        case Type.Danger:
            Alert = Danger;
            break;
        case Type.Warning:
            Alert = Warning;
            break;
        case Type.Info:
            Alert = Info;
            break;
        case Type.Light:
            Alert = Light;
            break;
        case Type.Dark:
            Alert = Dark;
            break;
        default:
            Alert = Primary;
            break
    }
  return (
    <Container>
        <InnerContainer>
            <Alert>{text}</Alert>
        </InnerContainer>
    </Container>
  );
}

export default Alert;

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const Container = styled('div')({
  position: "relative",
  padding: "0.75rem 1.25rem",
  marginBottom: "1rem",
  border: "1px solid transparent",
  borderRadius: "0.25rem",
  transition: "opacity 0.15s linear",
  boxSizing: "border-box",
  textAlign: "center"
});

const Primary = styled(Container)({
     color: "#004085",
     backgroundColor: "#cce5ff",
     borderColor: "#b8daff"
})

const Secondary = styled(Container)({
    color: "#383d41",
    backgroundColor: "#e2e3e5",
    borderColor: "#d6d8db"
})

const Success = styled(Container)({
    color: "#155724",
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb"
})

const Danger = styled(Container)({
    color: "#721c24",
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb"
})

const Warning = styled(Container)({
    color: "#856404",
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba"
})

const Info = styled(Container)({
    color: "#0c5460",
    backgroundColor: "#d1ecf1",
    borderColor: "#bee5eb"
})

const Light = styled(Container)({
    color: "#818182",
    backgroundColor: "#fefefe",
    borderColor: "#fdfdfe"
})

const Dark = styled(Container)({
    color: "#1b1e21",
    backgroundColor: "#d6d8d9",
    borderColor: "#c6c8ca"
})