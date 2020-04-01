import React from 'react';
import styled, { css } from 'react-emotion';

interface ModalProps {
  content: any;
  onClose: any;
  show: boolean
}

const Modal: React.FC<ModalProps> = ({ content, onClose, show }) => {
    return (
        <Container onClick={onClose} className={show? Enabled : Disabled}>
            <Content>
            <CloseIcon onClick={onClose}>&times;</CloseIcon>
                <HeaderContainer>
                    <ModalHeader>
                        <HeaderTitle>{content.headerTitle}</HeaderTitle>
                        <HeaderValueContainer>
                            <HeaderValue>{content.header}</HeaderValue>
                        </HeaderValueContainer>
                    </ModalHeader>
                </HeaderContainer>
                {content.bodyContent}
            </Content>

        </Container>
    );
}

export default Modal;

const Disabled = css({
    display: 'none',
});   

const Enabled = css({
    transition: 'transform .3s ease-out,-webkit-transform .3s ease-out',
}); 

const Container = styled('div')({
    position: 'fixed', /* Stay in place */
    zIndex: 1, /* Sit on top */
    paddingTop: '100px', /* Location of the box */
    left: 0,
    top: 0,
    width: '100%', /* Full width */
    height: '100%', /* Full height */
    overflow: 'auto', /* Enable scroll if needed */
    backgroundColor: 'rgba(0,0,0,0.4)', /* Black w/ opacity */
})

const Content = styled('div')({
    position: 'relative',
    flexDirection: 'column',
    margin: 'auto',
    padding: '15px',
    maxWidth: '800px',
    pointerEvents: 'auto',
    backgroundColor: '#fff',
    backgroundClip: 'padding-box',
    border: '1px solid rgba(0,0,0,.2)',
    borderRadius: '.3rem',
    outline: 0,
})

const CloseIcon = styled('span')({
    color: '#aaaaaa',
    float: 'right',
    fontSize: '28px',
    fontWeight: 'bold',
    '&:hover, &:focus': {
        color: '#000',
        textDecoration: 'none',
        cursor: 'pointer',
    }
})

const HeaderContainer = styled('div')({
    fontSize: '1.5rem',
    fontWeight: 500,
    boxSizing: 'border-box',
})

const ModalHeader = styled('div')({
    width: '630px',
    height: '76px',
    background: '#F3F0EB',
    border: '1px solid #C49E57',
    boxSizing: 'border-box',
    display: 'inline-flex',
    justifyContent: 'space-around',
    paddingTop: '20px',
})

const HeaderTitle = styled('span')({
    fontFamily: 'Avenir',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: '14px',
    lineHeight: '35px',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#C49E57',
})

const HeaderValueContainer = styled('div')({
    width: '428px',
    height: '36px',
    background: '#FFFFFF',
    border: '1px solid #E7E1D7',
    boxSizing: 'border-box',
    display: 'inline-flex',
    lineHeight: '20px',
    textAlign: 'center',
})

const HeaderValue = styled('span')({
    fontFamily: 'Avenir',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: '30px',
    color: '#000000',
    margin: 'auto',
})