const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeResultSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  testResults: [
    {
      input: String,
      expectedOutput: String,
      output: String,
      error: String,
      passed: Boolean,
      isExample: Boolean,
    },
  ],
  allPassed: {
    type: Boolean,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChallengeResult', ChallengeResultSchema);
