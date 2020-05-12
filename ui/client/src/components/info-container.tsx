import React from 'react';
import styled from 'react-emotion';
import { GetMultisigMembers_getMembers } from '../__generated__/GetMultisigMembers';
import { GetMultisig_getMultisig } from '../__generated__/GetMultisig';

interface ModalProps {
  members: GetMultisigMembers_getMembers[];
  multisigData: GetMultisig_getMultisig
}

const InfoContainer: React.FC<ModalProps> = ({ members, multisigData }) => {
    return (
        <div >
            <WalletInfo>
                <Row>
                    <ColTitle>Title </ColTitle>
                    <ColValue>{multisigData.title}</ColValue>
                </Row>
                <Row>
                    <ColTitle>Description </ColTitle>
                    <ColValue>{multisigData.description}</ColValue>
                </Row>
                <Row>
                    <ColTitle>Required Signatories: </ColTitle>
                    <ColValue>{multisigData.required}</ColValue>
                </Row>
            </WalletInfo>
            <Note>Below is a list of individuals part of the Community</Note>
            <MembersContainer>
                <MembersHeader>Members</MembersHeader>
                <MembersDiv>
                    {
                        members.map((m, index) => {
                            return (
                                <MembersRow key={index}>
                                    <MembersColTitle>{m.member.name}</MembersColTitle>
                                    <MembersColValue>{m.member.address}</MembersColValue>
                                </MembersRow>
                            )
                        })
                    }
                </MembersDiv>
            </MembersContainer>
            
            

        </div>
    );
}

export default InfoContainer;

const WalletInfo = styled('div')({
    textAlign: 'center',
    marginTop: '1em',
    marginBottom: '2.7em',
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

const Note = styled('span')({
    fontFamily: 'Avenir',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: '10px',
    lineHeight: '16px',
    color: '#999',
    display: 'block',
    textAlign: 'center',
})

const MembersContainer = styled('div')({
    width: '570px',
    maxHeight: '20em',
    border: '1px solid #E7E1D7',
    boxSizing: 'border-box',
    margin: '1em auto',
    overflowY: 'auto',
    overflowX: 'hidden',
})

const MembersHeader = styled('div')({
    width: '570px',
    height: '36px',
    background: '#E7E1D7',
    border: '1px solid #E7E1D7',
    boxSizing: 'border-box',
    fontFamily: 'Avenir',
    fontStyle: 'normal',
    fontSize: '12px',
    lineHeight: '33px',
    textTransform: 'uppercase',
    color: '#C49E57',
})

const MembersDiv = styled('div')({
    padding: '1em',
    '&:after, &:before': {
        boxSizing: 'border-box'
    }
})

const MembersRow = styled('div')({
    marginBottom: '15px',
    display: 'flex',
    flexWrap: 'wrap',
    marginRight: '-15px',
    marginLeft: '-15px',
})

const MembersCols = styled('div')({
    fontWeight: 800,
    fontFamily: 'Avenir',
    fontSize: '12px',
    lineHeight: '19px',
    position: 'relative',
    width: '100%',
    paddingRight: '15px',
    paddingLeft: '15px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
})

const MembersColTitle = styled(MembersCols)({
    textAlign: 'end',
    color: '#C49E57',
    flex: '0 0 25%',
    maxWidth: '25%',
})

const MembersColValue = styled(MembersCols)({
    textAlign: 'start',
    fontSize: '10px',
    fontStyle: 'normal',
    color: '#000000',
    flex: '0 0 75%',
    maxWidth: '75%',
})
