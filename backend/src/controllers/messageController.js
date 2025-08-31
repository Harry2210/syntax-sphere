const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Create a new conversation or get an existing one
// @route   POST /api/messages/conversation/:recipientId
// @access  Private
exports.createConversation = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user.id;

    // Check if a conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (conversation) {
      // If conversation exists, return it
      return res.json(conversation);
    }

    // If no conversation exists, create a new one
    conversation = new Conversation({
      participants: [senderId, recipientId],
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Send a new message
// @route   POST /api/messages/:conversationId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // Check if the current user is a participant in the conversation
    if (!conversation.participants.includes(senderId)) {
      return res.status(401).json({ msg: 'Not authorized to send messages to this conversation' });
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      content,
    });

    await newMessage.save();

    // Update the last message field on the conversation
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all conversations for the authenticated user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'username') // Populate with participant usernames
      .populate('lastMessage') // Populate the last message for a quick preview
      .sort({ 'lastMessage.timestamp': -1 }); // Sort by most recent message

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all messages for a specific conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'username') // Populate with sender's username
      .sort({ timestamp: 1 }); // Sort in ascending order

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};