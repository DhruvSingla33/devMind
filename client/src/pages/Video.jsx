
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import Comment from './Comment';
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {format} from "timeago.js";
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

const Buttons = styled.div`
  display: flex;
  gap: 20px;
  color: ${({ theme }) => theme.text};
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const Hr = styled.hr`
  margin: 15px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft};
`;

const Recommendation = styled.div`
  flex: 2;
`;
const Channel = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ChannelInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

const ChannelDetail = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.text};
`;

const ChannelName = styled.span`
  font-weight: 500;
`;

const ChannelCounter = styled.span`
  margin-top: 5px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 12px;
`;

const Description = styled.p`
  font-size: 14px;
`;

const Subscribe = styled.button`
  background-color: #cc1a00;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 3px;
  height: max-content;
  padding: 10px 20px;
  cursor: pointer;
`;

const Video = () => {
  const path = useLocation().pathname.split("/")[3];
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
      const [post, setPost] = useState(null);
      const [refreshData, setRefreshData] = useState(false);
  
    

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/videos/find/${path}`);
        setVideo(response.data);
      } catch (error) {
        console.error("Error fetching video data", error);
      } finally {
        setLoading(false); // Set loading to false once the request is complete
      }
    };

    fetchVideo();
  }, [refreshData]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!video) {
    return <p>No video data available.</p>;
  }
  const postComment = async () => {
    console.log("hii");
    const res = await fetch(`http://localhost:8000/api/videos/${path}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Dhruv",  // or username if available
        text: commentText,
      }),
    });
  
    const result = await res.json();
    if (result.message === "Comment added") {
      setCommentText("");
      setRefreshData(prev => !prev); // 🔁 trigger re-fetch
      alert("comment added");
    } else {
      alert("Failed to post comment");
    }
  
  };
  return (
    <Container>
      <Content>
        <VideoWrapper>
          <iframe
            width="100%"
            height="720"
            src={`http://localhost:8000/${video.videoUrl}`}
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </VideoWrapper>
        <Title>{video.title}</Title>
        <Details>
        <Info>{format(video.createdAt)} Created by {video.userName}</Info>
          
        </Details>
        <div
  className="comment-section"
  style={{
    marginTop: "2rem",
    padding: "1.5rem",
    backgroundColor:  "#6CB4EE",
    borderRadius: "12px",
    maxWidth: "800px",
    margin: "2rem auto",
  }}
>
  <h2 style={{ marginBottom: "1rem", color: "#333" }}>Comments</h2>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (!commentText) return;
      postComment();
    }}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      marginBottom: "1.5rem",
    }}
  >
    <textarea
      rows="3"
      placeholder="Write a comment..."
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      style={{
        padding: "0.75rem",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "1rem",
        resize: "vertical",
      }}
    />
    <button
      type="submit"
      style={{
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "6px",
        fontSize: "1rem",
        cursor: "pointer",
        alignSelf: "flex-start",
      }}
    >
      Post Comment
    </button>
  </form>

  <div
    className="comment-list"
    style={{
      backgroundColor: "#fff",
      padding: "1rem",
      borderRadius: "10px",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    }}
  >
    {video?.comments?.length > 0 ? (
  video.comments.map((comment, index) => (
    <div
      key={index}
      className="comment-item"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        marginBottom: "1rem",
        backgroundColor: "#e6f0ff",
        padding: "1rem",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      }}
    >
      {/* Profile Circle / Initial */}
      <div
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "1rem",
          flexShrink: 0,
        }}
      >
        {comment.username.charAt(0).toUpperCase()}
      </div>

      {/* Comment Content */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "0.3rem" }}>
          <strong style={{ color: "#333", fontSize: "1rem" }}>
            {comment.username}
          </strong>
          <small style={{ marginLeft: "0.5rem", color: "#888" }}>
            {new Date(comment.date).toLocaleString()}
          </small>
        </div>
        <p style={{ margin: 0, color: "#444", fontSize: "0.95rem" }}>
          {comment.text}
        </p>
      </div>
    </div>
  ))
) : (
  <p style={{ color: "#777" }}>No comments yet.</p>
)}

  </div>
  </div>
       
      </Content>
     
    </Container>
  );
};

export default Video;
