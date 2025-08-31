import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardPage = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [friendLeaderboard, setFriendLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        // Fetch Global Leaderboard
        const globalRes = await axios.get('http://localhost:5000/api/challenges/leaderboard/global');
        setGlobalLeaderboard(globalRes.data);

        // Fetch Friend Leaderboard
        const friendRes = await axios.get('http://localhost:5000/api/challenges/leaderboard/friends', {
          headers: {
            'x-auth-token': 'YOUR_AUTH_TOKEN', // Replace with a real token
          },
        });
        setFriendLeaderboard(friendRes.data);
      } catch (err) {
        console.error('Failed to fetch leaderboards:', err);
        setError('Failed to load leaderboards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading Leaderboards...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">
        {error}
      </div>
    );
  }

  const renderLeaderboard = (title, data) => (
    <div className="w-full md:w-1/2 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-200">{title}</h2>
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        {data.length > 0 ? (
          <ul className="space-y-4">
            {data.map((user, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg shadow-inner transition-transform transform hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-purple-400">{index + 1}.</span>
                  <span className="text-lg text-white">{user.username}</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">{user.totalPoints} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400">No data to display.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-blue-500">Leaderboards</h1>
        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
          {renderLeaderboard('Global Leaderboard', globalLeaderboard)}
          {renderLeaderboard('Friend Leaderboard', friendLeaderboard)}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
