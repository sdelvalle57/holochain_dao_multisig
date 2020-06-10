import React, { useState } from 'react';
import styled from 'react-emotion';
import { GetMultisigMembers } from '../__generated__/GetMultisigMembers';
import { GetMultisig_getMultisig } from '../__generated__/GetMultisig';
import { Query } from 'react-apollo';
import { GET_MEMBER } from '../queries';
import { GetMember, GetMemberVariables } from '../__generated__/GetMember';

interface ModalProps {
  members: GetMultisigMembers;
  multisigData: GetMultisig_getMultisig;
  multisigAddress: string;
  organizations: (string | null)[]
}

interface FilterProps {
    onSelect: any
}

interface MemberProps {
    member: GetMember | null | undefined,
    filter: number
}

const Filter: React.FC<FilterProps> = ({onSelect})=> {
    return (
        <StyledFilter>
            Filter
            <StyledSelector onChange={({target}) => { onSelect(parseInt(target.value)) }} >
                <option key="0" value="0">Active</option>
                <option key="1" value="1">Inactive</option>
                <option key="2" value="2">All</option>
            </StyledSelector>
        </StyledFilter>
    )
}

const Member: React.FC<MemberProps> = ({member, filter}) => {

    const renderMember = (member: GetMember | null | undefined) => {
        if(!member) return null
        return (
            <>
                <MembersColTitle>{member.getMember?.member.name}</MembersColTitle>
                <MembersColValue color={!member.getMember?.active ? "red" : null}>
                    {member.getMember?.member.address}
                </MembersColValue>
            </>
        )
    }

    switch(filter) {
        case 0: 
            if(member?.getMember?.active) return renderMember(member)
            return null;
        case 1:
            if(!member?.getMember?.active) return renderMember(member)
            return null;
        default:
            return renderMember(member)
    }

}

const InfoContainer: React.FC<ModalProps> = ({ 
    members, 
    multisigData, 
    organizations,
    multisigAddress
}) => {
    const [filter, setFilter] = useState(0);

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
                <Row>
                    <ColTitle>Organizations: </ColTitle>
                    <ColValue>{organizations.length}</ColValue>
                </Row>
            </WalletInfo>
            <Note>Below is a list of individuals part of the Community</Note>
            <MembersContainer>
            <MembersHeader>Members <Filter onSelect={(value: number) => setFilter(value) } /></MembersHeader>
                <MembersDiv>
                    {
                        members.getMembers.map((m, index) => {
                            return (
                                <MembersRow key={index}>
                                    <Query<GetMember, GetMemberVariables> 
                                    query = { GET_MEMBER } 
                                    fetchPolicy = "network-only"
                                    variables = {{
                                        entry_address: m,
                                        multisig_address: multisigAddress
                                      }} >
                                        {({data, error, loading}) => {
                                            if(error) return (
                                                <>
                                                    <MembersColTitle>Error fetching member</MembersColTitle>
                                                    <MembersColValue>{m}</MembersColValue>
                                                </>
                                            );
                                            if(loading) return (
                                                <>
                                                    <MembersColTitle>Loading</MembersColTitle>
                                                    <MembersColValue>{m}</MembersColValue>
                                                </>
                                            )
                                            return (
                                                <Member member = {data} filter={filter}/>
                                            )
                                            
                                        }}
                                    </Query>
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

const MembersColValue = styled(MembersCols)((props: any) => ({
    textAlign: 'start',
    fontSize: '10px',
    fontStyle: 'normal',
    flex: '0 0 75%',
    maxWidth: '75%',
    color: props.color || '#000000'
    

}))


export const StyledFilter = styled('div')({
    width: '280px',
    fontSize: '9px',
    display: 'inline-block',
    textAlign: 'center',
    position: 'absolute'
})

const StyledSelector = styled('select')({
    textDecoration: 'underline',
    border: 'none',
    MozAppearance: 'none',
    textIndent: '1px',
    background: 'transparent',
    fontSize: "10px",
    color: '#C49E57'
})