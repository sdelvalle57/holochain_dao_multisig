import React from 'react';
import styled, { css } from 'react-emotion';
import Loading from './loading';

interface CardProps {
  image: string;
  title: string;
  enabled: boolean;
  onClick: any;
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({ image, title, onClick, enabled, loading }) => {
  const className = enabled ? Enabled : Disabled;

  if(loading) return <Loading />

  return (
    <Container onClick={enabled ? onClick : null} className = {className}>
      <Img src={image} />
      <Title>{title}</Title>
    </Container>
  );
}

export default Card;

const Disabled = css({
    opacity: 0.5,
});   

const Enabled = css({
    '&:hover': {
        boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
    }
}); 

const Container = styled('div')({
    width: '150px',
    maxHeight: '215px',
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
    margin: '20px 20px 20px 0px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    wordWrap: 'break-word',
    backgroundColor: '#fff',
    backgroundClip: 'border-box',
    border: '1px solid rgba(0,0,0,.125)',
    borderRadius: '.25rem',
})

const Img = styled('img')({
    width: '120px',
    height: '120px',
    background: 'rgba(231, 225, 215, 0.5)',
    border: '1px solid #C49E57',
    boxSizing: 'border-box',
    margin: '15px auto',
    padding: '12px',
})

const Title = styled('div')({
    fontFamily: 'Avenir',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: '12px',
    lineHeight: '19px',
    textAlign: 'center',
    color: '#C49E57',
    marginTop: '0.5em',
    wordWrap: 'break-word',
    whiteSpace: 'initial',
})
