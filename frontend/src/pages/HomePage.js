import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../components/Post';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts');
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      // You'd need to send the user's auth token with the request
      const res = await axios.post('/api/posts', { content: newPostContent });
      setPosts([res.data, ...posts]); // Add the new post to the top
      setNewPostContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button type="submit">Post</button>
      </form>
      <div className="post-feed">
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;