import User from '../models/User';
import Post from '../models/Post';
import Challenge from '../models/Challenge';

// @desc    Search for users, posts, or challenges
// @route   GET /api/search
// @access  Public
exports.search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    const searchQuery = new RegExp(query, 'i'); // Case-insensitive search

    // Search for users by username
    const users = await User.find({ username: searchQuery }).limit(10);

    // Search for posts by content
    const posts = await Post.find({ content: searchQuery }).limit(10).populate('author', 'username');

    // Search for challenges by title or description
    const challenges = await Challenge.find({
      $or: [{ title: searchQuery }, { description: searchQuery }],
    }).limit(10);

    res.json({
      users,
      posts,
      challenges,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
