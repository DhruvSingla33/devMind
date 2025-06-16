import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { format } from "timeago.js";

const Container = styled.div`
  display: flex;
  gap: 24px;
`;

const Content = styled.div`
  flex: 5;
`;

const VideoWrapper = styled.div``;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 400;
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text};
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Info = styled.span`
  color: ${({ theme }) => theme.textSoft};
`;

const Hr = styled.hr`
  margin: 15px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft};
`;

const Video = () => {
  const path = useLocation().pathname.split("/")[3];
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/videos/find/${path}`);
        setVideo(response.data);
      } catch (error) {
        console.error("Error fetching video data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [path]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!video) {
    return <p>No video data available.</p>;
  }

  return (
    <Container>
      <Content>
        <VideoWrapper>
          <iframe
            width="100%"
            height="720"
            src={`http://localhost:8000/${video.videoUrl}`}
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </VideoWrapper>
        <Title>{video.title}</Title>
        <Details>
          <Info>{format(video.createdAt)} · Created by {video.userName}</Info>
        </Details>
        <Hr />
      </Content>
    </Container>
  );
};

export default Video;
