import React, { useState } from 'react';
import axios from 'axios';

const Post = ({ post }) => {
  const [likes, setLikes] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      const res = await axios.put(`/api/posts/like/${post._id}`);
      setLikes(res.data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/posts/comment/${post._id}`, { content: commentText });
      setComments([res.data, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post-container">
      <p>{post.content}</p>
      <div>
        <button onClick={handleLike}>Like ({likes})</button>
        <button>Comment ({comments.length})</button>
      </div>
      <div className="comments-section">
        {comments.map(comment => (
          <p key={comment._id}><strong>{comment.author.username}</strong>: {comment.content}</p>
        ))}
        <form onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Post;