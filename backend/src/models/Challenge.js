const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  languages: {
    type: [String],
    required: true,
    enum: ['python', 'javascript', 'java', 'cpp'], // Supported languages
  },
  points: {
    type: Number,
    required: true,
  },
  testCases: [
    {
      input: {
        type: String,
        required: true,
      },
      expectedOutput: {
        type: String,
        required: true,
      },
      isExample: { // Flag to show or hide the test case on the frontend
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
