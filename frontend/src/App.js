import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/Profile';
import Challenges from './pages/Challenges';
import ChallengePage from './pages/ChallengePage';
import LeaderboardPage from './pages/LeaderboardPage';
import Search from './pages/Search';

const App = () => {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white font-sans">
        {/* Navigation Bar */}
        <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-500">
              Syntax Sphere
            </Link>
            <div className="space-x-4 flex items-center">
              <Link to="/" className="hover:text-blue-400 transition-colors">
                Home
              </Link>
              <Link to="/challenges" className="hover:text-blue-400 transition-colors">
                Challenges
              </Link>
              <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">
                Leaderboard
              </Link>
              <Link to="/profile" className="hover:text-blue-400 transition-colors">
                Profile
              </Link>
              <Link to="/search" className="hover:text-blue-400 transition-colors">
                Search
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="pt-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:id" element={<ChallengePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
