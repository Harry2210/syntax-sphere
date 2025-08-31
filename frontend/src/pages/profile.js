import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // In a real app, you'd get the user ID from the JWT token
      const userId = 'your-user-id'; // This is a placeholder
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>
      {/* You can add more profile details here as you expand the models */}
    </div>
  );
};

export default ProfilePage;