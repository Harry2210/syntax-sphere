// ... existing code from previous step ...

// @desc    Like a post
// @route   PUT /api/posts/like/:id
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift(req.user.id); // Add user's ID to the likes array
    await post.save();

    res.json(post.likes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/comment/:id
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = new Comment({
      post: req.params.id,
      author: req.user.id,
      content: req.body.content,
    });

    const comment = await newComment.save();
    post.comments.unshift(comment._id); // Add comment ID to the post
    await post.save();

    res.json(comment);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};