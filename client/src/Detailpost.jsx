import { useState, useEffect, useContext } from 'react';

import { Box, Typography, styled } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from "axios";
import Comment from './Comment'
import { useLocation } from "react-router-dom";
import Post from './Post';
const Container = styled(Box)(({ theme }) => ({
    margin: '50px 100px',
    [theme.breakpoints.down('md')]: {
        margin: 0
    },
}));

const Image = styled('img')({
    width: '100%',
    height: '50vh',
    objectFit: 'cover'
});

const EditIcon = styled(Edit)`
    margin: 5px;
    padding: 5px;
    border: 1px solid #878787;
    border-radius: 10px;
`;

const DeleteIcon = styled(Delete)`
    margin: 5px;
    padding: 5px;
    border: 1px solid #878787;
    border-radius: 10px;
`;

const Heading = styled(Typography)`
    font-size: 38px;
    font-weight: 600;
    text-align: center;
    margin: 50px 0 10px 0;
`;

const Author = styled(Box)(({ theme }) => ({
    color: '#878787',
    display: 'flex',
    margin: '20px 0',
    [theme.breakpoints.down('sm')]: {
        display: 'block'
    },
}));

const Detailpost = () => {
   
    const [commentText, setCommentText] = useState("");
    const [post, setPost] = useState(null);
    const path = useLocation().pathname.split("/")[3];
    const [refreshData, setRefreshData] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchVideo = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/posts/find/${path}`);
          setPost(response.data);
        //   console.log(response.data);
          console.log(post);
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
  
    if (!post) {
      return <p>No post data available.</p>;
    }
    const postComment = async () => {
      console.log("hii");
      const res = await fetch(`http://localhost:8000/api/posts/${path}/comments`, {
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
      <>
        <Container>
            <Image src={`http://localhost:8000/uploads/${post.thumbnail}`} alt="post" />
          
            <Heading>{post.title}</Heading>

            <Author>
               
                    <Typography>Author: <span style={{fontWeight: 600}}>{post.username}</span></Typography>
             
                <Typography style={{marginLeft: 'auto'}}>{new Date(post.createdAt).toDateString()}</Typography>
            </Author>

            <Typography>{post.description}</Typography>
           
        </Container>
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
    {post?.comments?.length > 0 ? (
  post.comments.map((comment, index) => (
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
        {/* <Comment></Comment> */}
        
        </>
    )
}

export default Detailpost;