const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

// @desc    Like a user
// @route   POST /api/matches/like/:userId
// @access  Private
router.post('/like/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const likedUserId = req.params.userId;

    // Prevent self-liking
    if (currentUserId === likedUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot like yourself'
      });
    }

    // Check if target user exists
    const likedUser = await User.findById(likedUserId);
    if (!likedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if user already liked this person
    const existingLike = currentUser.likes.find(like => like.user.toString() === likedUserId);
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this user'
      });
    }

    // Remove from dislikes if exists
    currentUser.dislikes = currentUser.dislikes.filter(dislike => dislike.user.toString() !== likedUserId);

    // Add to likes
    currentUser.likes.push({
      user: likedUserId,
      likedAt: new Date()
    });

    // Check if the liked user has also liked the current user (mutual like)
    const mutualLike = likedUser.likes.find(like => like.user.toString() === currentUserId);
    let isMatch = false;
    let match = null;

    if (mutualLike) {
      // It's a match! Create a match record
      match = await Match.create({
        users: [currentUserId, likedUserId],
        matchedAt: new Date()
      });

      // Add to both users' matches
      currentUser.matches.push({
        user: likedUserId,
        matchedAt: new Date()
      });

      likedUser.matches.push({
        user: currentUserId,
        matchedAt: new Date()
      });

      await likedUser.save();
      isMatch = true;
    }

    await currentUser.save();

    res.status(200).json({
      success: true,
      isMatch,
      match: isMatch ? match : null,
      message: isMatch ? 'It\'s a match!' : 'Like sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error processing like',
      error: error.message
    });
  }
});

// @desc    Dislike a user
// @route   POST /api/matches/dislike/:userId
// @access  Private
router.post('/dislike/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const dislikedUserId = req.params.userId;

    // Prevent self-disliking
    if (currentUserId === dislikedUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot dislike yourself'
      });
    }

    // Check if target user exists
    const dislikedUser = await User.findById(dislikedUserId);
    if (!dislikedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if user already disliked this person
    const existingDislike = currentUser.dislikes.find(dislike => dislike.user.toString() === dislikedUserId);
    if (existingDislike) {
      return res.status(400).json({
        success: false,
        message: 'You already disliked this user'
      });
    }

    // Remove from likes if exists
    currentUser.likes = currentUser.likes.filter(like => like.user.toString() !== dislikedUserId);

    // Add to dislikes
    currentUser.dislikes.push({
      user: dislikedUserId,
      dislikedAt: new Date()
    });

    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Dislike recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error processing dislike',
      error: error.message
    });
  }
});

// @desc    Undo last action (like/dislike)
// @route   POST /api/matches/undo/:userId
// @access  Private
router.post('/undo/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);

    // Remove from likes
    const likeIndex = currentUser.likes.findIndex(like => like.user.toString() === targetUserId);
    if (likeIndex > -1) {
      currentUser.likes.splice(likeIndex, 1);
    }

    // Remove from dislikes
    const dislikeIndex = currentUser.dislikes.findIndex(dislike => dislike.user.toString() === targetUserId);
    if (dislikeIndex > -1) {
      currentUser.dislikes.splice(dislikeIndex, 1);
    }

    // If there was a match, remove it
    const matchIndex = currentUser.matches.findIndex(match => match.user.toString() === targetUserId);
    if (matchIndex > -1) {
      currentUser.matches.splice(matchIndex, 1);
      
      // Also remove from the other user and deactivate the match record
      const targetUser = await User.findById(targetUserId);
      const targetMatchIndex = targetUser.matches.findIndex(match => match.user.toString() === currentUserId);
      if (targetMatchIndex > -1) {
        targetUser.matches.splice(targetMatchIndex, 1);
        await targetUser.save();
      }

      // Deactivate match record
      await Match.findOneAndUpdate(
        { users: { $all: [currentUserId, targetUserId] } },
        { isActive: false }
      );
    }

    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Action undone successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error undoing action',
      error: error.message
    });
  }
});

// @desc    Get user's matches
// @route   GET /api/matches
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const matches = await Match.findUserMatches(req.user.id);

    // Format matches for frontend
    const formattedMatches = matches.map(match => {
      const matchedUser = match.users.find(user => user._id.toString() !== req.user.id);
      return {
        _id: match._id,
        user: matchedUser,
        matchedAt: match.matchedAt,
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt
      };
    });

    res.status(200).json({
      success: true,
      matches: formattedMatches,
      count: formattedMatches.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching matches',
      error: error.message
    });
  }
});

// @desc    Get specific match details
// @route   GET /api/matches/:matchId
// @access  Private
router.get('/:matchId', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('users', 'profile isOnline lastActive')
      .populate('lastMessage');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify user is part of this match
    const isUserInMatch = match.users.some(user => user._id.toString() === req.user.id);
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    const matchedUser = match.users.find(user => user._id.toString() !== req.user.id);

    res.status(200).json({
      success: true,
      match: {
        _id: match._id,
        user: matchedUser,
        matchedAt: match.matchedAt,
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt,
        isActive: match.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching match details',
      error: error.message
    });
  }
});

// @desc    Unmatch with a user
// @route   DELETE /api/matches/:matchId
// @access  Private
router.delete('/:matchId', protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Verify user is part of this match
    const isUserInMatch = match.users.some(userId => userId.toString() === req.user.id);
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    // Deactivate the match
    match.isActive = false;
    await match.save();

    // Remove from both users' matches arrays
    const [user1Id, user2Id] = match.users;
    
    await User.findByIdAndUpdate(user1Id, {
      $pull: { matches: { user: user2Id } }
    });

    await User.findByIdAndUpdate(user2Id, {
      $pull: { matches: { user: user1Id } }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unmatched'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error unmatching',
      error: error.message
    });
  }
});

module.exports = router;
