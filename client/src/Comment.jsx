import React, { useState, useEffect } from "react";
import axios from "axios";

function Comment() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments from backend on component mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/comments");
        setComments(response.data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchComments();
  }, []);

  // Handle form submission to save a new comment to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        const response = await axios.post("http://localhost:8000/api/comments", { text: newComment });
        setComments([...comments, response.data]); // Update UI with new comment
        setNewComment(""); // Clear input field
      } catch (error) {
        console.error("Failed to save comment:", error);
      }
    }
  };

  return (
    <div className="comment-section">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border rounded mb-2"
        ></textarea>
        <button type="submit" className="btn btn-primary">Post Comment</button>
      </form>

      {/* Display comments */}
      <div className="comments-list mt-6">
        <h1 className="text-lg font-bold text-gray-700 mb-2">All Comments</h1>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="comment p-3 mb-2 bg-gray-100 rounded-lg shadow-sm text-gray-800"
            >
              {comment.text}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}

export default Comment;
