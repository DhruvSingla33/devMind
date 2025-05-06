import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';
import Fuse from 'fuse.js';

import { Grid, Box, TextField } from '@mui/material';
import { Link } from 'react-router-dom';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/posts');
        setPosts(response.data);
        setSearchResults(response.data);  // Initialize search results with all posts
      } catch (error) {
        console.error("Error fetching posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fuse = new Fuse(posts, { keys: ['title'], includeScore: true });
    if (searchTerm === '') {
      setSearchResults(posts);
    } else {
      const results = fuse.search(searchTerm);
      setSearchResults(results.map(result => result.item));
    }
  }, [searchTerm, posts]);

  if (loading) return <p>Loading posts...</p>;

  return (
    <Box data-theme="light" sx={{ marginTop: '80px' }}>
     {
           <Link to="/addpost" className="text-2xl"> <button className="btn btn-accent w-2/12">+Add Post</button></Link>
          }
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Grid container spacing={3}>
        {searchResults.length ? (
          searchResults.map(post => (
            <Grid item lg={3} sm={4} xs={12} key={post._id}>
              <Link style={{ textDecoration: 'none', color: 'inherit' }} to={`details/${post._id}`}>
                <Post
                  title={post.title}
                  slug={post.slug}
                  description={post.description}
                  thumbnail={post.thumbnail}
                  createdAt={post.createdAt}
                  username={post.username}
                />
              </Link>
            </Grid>
          ))
        ) : (
          <Box style={{ color: '#878787', margin: '30px 80px', fontSize: 18 }}>
            No data is available for the selected category
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default Posts;
