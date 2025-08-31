const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { bio, skills, portfolio, socialLinks } = req.body;
  const profileFields = {};
  if (bio) profileFields.bio = bio;
  if (skills) profileFields.skills = skills;
  if (portfolio) profileFields.portfolio = portfolio;
  if (socialLinks) profileFields.socialLinks = socialLinks;

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the authenticated user is the owner of the profile
    if (user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { profile: profileFields } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Follow a user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the user is already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Already following this user' });
    }

    // Add user to the following list
    currentUser.following.unshift(userToFollow._id);
    await currentUser.save();

    // Add current user to the followers list of the user being followed
    userToFollow.followers.unshift(currentUser._id);
    await userToFollow.save();

    res.json({ msg: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the user is not following
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'You are not following this user' });
    }

    // Remove user from the following list
    currentUser.following = currentUser.following.filter(
      (followId) => followId.toString() !== req.params.id
    );
    await currentUser.save();

    // Remove current user from the followers list of the user being unfollowed
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== req.user.id
    );
    await userToUnfollow.save();

    res.json({ msg: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
