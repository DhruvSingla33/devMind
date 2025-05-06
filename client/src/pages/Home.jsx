import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Card from "../components/Card";
import axios from "axios";
import { Link } from "react-router-dom";
import Comment from './Comment';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Home = ({type}) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const res = await axios.get(`http://localhost:8000/api/videos`);
      console.log(res.data);
      setVideos(res.data);
    };
    fetchVideos();
  }, [type]);

  return (
    <div className="mt-20" data-theme="light">
    <Link to="/upload" className="text-2xl mb-4 block"> 
        <button className="btn btn-accent w-2/12">+Add Tutorial</button>
    </Link>
    <Container className="mt-4">
      {videos.map((video) => (
        <Card key={video._id} video={video}/>
      ))}
    </Container>
    
    {/* <Comment></Comment> */}
</div>

  );
};

export default Home;
