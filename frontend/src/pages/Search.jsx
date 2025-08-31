import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('An error occurred during search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, data, type) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-purple-400">{title}</h2>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              {type === 'users' && (
                <p className="text-lg font-semibold text-white">{item.username}</p>
              )}
              {type === 'posts' && (
                <>
                  <p className="text-gray-300">{item.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    by <span className="text-gray-400">{item.author.username}</span>
                  </p>
                </>
              )}
              {type === 'challenges' && (
                <p className="text-lg font-semibold text-white">{item.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-blue-500">Search Syntax Sphere</h1>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex rounded-lg shadow-lg overflow-hidden">
            <input
              type="text"
              className="w-full p-4 text-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
              placeholder="Search for users, posts, challenges..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center text-gray-400 text-xl">Searching...</div>
        )}

        {error && (
          <div className="text-center text-red-500 text-xl">{error}</div>
        )}

        {results && (
          <div className="mt-10">
            {renderSection('Users', results.users, 'users')}
            {renderSection('Posts', results.posts, 'posts')}
            {renderSection('Challenges', results.challenges, 'challenges')}
            {results.users.length === 0 && results.posts.length === 0 && results.challenges.length === 0 && (
              <div className="text-center text-gray-400 text-xl">No results found for "{query}".</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
