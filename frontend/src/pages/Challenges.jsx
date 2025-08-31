import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/challenges');
        setChallenges(res.data);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        setError('Failed to load challenges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading Challenges...
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

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-blue-500">Coding Challenges</h1>
        <div className="space-y-6">
          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-gray-800 rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105"
              >
                <h2 className="text-2xl font-bold mb-2 text-purple-400">{challenge.title}</h2>
                <p className="text-gray-300 mb-4">{challenge.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {challenge.languages.map((lang) => (
                    <span
                      key={lang}
                      className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/challenges/${challenge._id}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
                >
                  Solve Challenge
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No challenges available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
