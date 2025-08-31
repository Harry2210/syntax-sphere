const Challenge = require('../models/Challenge');
const ChallengeResult = require('../models/ChallengeResult');
const User = require('../models/User'); // Import the User model
const { executeCode } = require('../code-execution-engine/executor');

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().select('-testCases');
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a specific challenge
// @route   GET /api/challenges/:id
// @access  Public
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    // Only return example test cases to the frontend
    const publicChallenge = {
      ...challenge.toObject(),
      testCases: challenge.testCases.filter(tc => tc.isExample),
    };
    res.json(publicChallenge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Submit and evaluate code for a challenge
// @route   POST /api/challenges/:id/submit
// @access  Private
exports.submitCode = async (req, res) => {
  const { code, language } = req.body;
  const userId = req.user.id;
  const challengeId = req.params.id;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    if (!challenge.languages.includes(language)) {
      return res.status(400).json({ msg: `This challenge does not support ${language}` });
    }

    const results = [];
    let passedTests = 0;

    // Iterate through all test cases, including hidden ones
    for (const testCase of challenge.testCases) {
      const { input, expectedOutput } = testCase;
      try {
        const output = await executeCode(language, code, input);
        const passed = output.trim() === expectedOutput.trim();
        results.push({
          input,
          expectedOutput,
          output,
          passed,
          isExample: testCase.isExample,
        });
        if (passed) {
          passedTests++;
        }
      } catch (err) {
        results.push({
          input,
          error: err.toString(),
          passed: false,
          isExample: testCase.isExample,
        });
      }
    }

    const allPassed = passedTests === challenge.testCases.length;
    let pointsEarned = 0;
    if (allPassed) {
      pointsEarned = challenge.points;
    }

    // Save the result to the database
    const newResult = new ChallengeResult({
      user: userId,
      challenge: challengeId,
      points: pointsEarned,
      testResults: results,
      allPassed,
    });
    await newResult.save();

    res.json({
      message: allPassed ? 'Solution accepted!' : 'Some test cases failed.',
      results,
      pointsEarned,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get the Global Leaderboard
// @route   GET /api/challenges/leaderboard/global
// @access  Public
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    // Aggregate to get the sum of points for each user
    const leaderboard = await ChallengeResult.aggregate([
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $limit: 20, // Limit to top 20 for a clean leaderboard
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userProfile',
        },
      },
      {
        $unwind: '$userProfile',
      },
      {
        $project: {
          _id: 0,
          username: '$userProfile.username',
          totalPoints: '$totalPoints',
        },
      },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get the Friend Leaderboard
// @route   GET /api/challenges/leaderboard/friends
// @access  Private
exports.getFriendLeaderboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const friends = [...user.following, req.user.id]; // Include the current user

    const leaderboard = await ChallengeResult.aggregate([
      {
        $match: {
          user: { $in: friends },
        },
      },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userProfile',
        },
      },
      {
        $unwind: '$userProfile',
      },
      {
        $project: {
          _id: 0,
          username: '$userProfile.username',
          totalPoints: '$totalPoints',
        },
      },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};