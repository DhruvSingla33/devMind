import React, { useState } from "react";

function Comment() {
  const [comments, setComments] = useState([]); // State for storing comments
  const [newComment, setNewComment] = useState(""); // State for new comment input

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([...comments, newComment]); // Add the new comment to comments array
      setNewComment(""); // Clear the input field
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
          comments.map((comment, index) => (
            <div
              key={index}
              className="comment p-3 mb-2 bg-gray-100 rounded-lg shadow-sm text-gray-800"
            >
              {comment}
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
