// Post.js
import React from 'react';
import { styled, Box, Typography } from '@mui/material';

const Container = styled(Box)`
    border: 1px solid #d3cede;
    border-radius: 10px;
    margin: 10px;
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 350px;
    & > img, & > p {
        padding: 0 5px 5px 5px;
    }
`;

const Image = styled('img')({
    width: '100%',
    objectFit: 'cover',
    borderRadius: '10px 10px 0 0',
    height: 150
});

const Text = styled(Typography)`
    color: #878787
    font-size: 12px;
`;

const Heading = styled(Typography)`
    font-size: 18px;
    font-weight: 600
`;

const Details = styled(Typography)`
    font-size: 14px;
    word-break: break-word;
`;
const Post = ({ title, slug, description, thumbnail, createdAt, username }) => {
    const addEllipsis = (str, limit) => {
        return str.length > limit ? str.substring(0, limit) + '...' : str;
    } 
    return (
       
      <Container>
       
        <Image src={`http://localhost:8000/uploads/${thumbnail}`} alt="post" />
        {/* <Text>{slug}</Text> */}
        <Heading>{addEllipsis(title, 20)}</Heading>
        <Text>Author: {username}</Text>
        <Details>{addEllipsis(description, 100)}</Details>
        <small>Created on {new Date(createdAt).toLocaleDateString()}</small>
      </Container>
    );
  };
  
  export default Post;
  


