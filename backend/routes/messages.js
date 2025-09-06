const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

// @desc    Send a message
// @route   POST /api/messages/:matchId
// @access  Private
router.post('/:matchId', protect, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const matchId = req.params.matchId;
    const senderId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify the match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (!match.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to inactive match'
      });
    }

    const isUserInMatch = match.users.some(userId => userId.toString() === senderId);
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    // Find the receiver (the other user in the match)
    const receiverId = match.users.find(userId => userId.toString() !== senderId);

    // Create the message
    const message = await Message.create({
      match: matchId,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      isDelivered: true,
      deliveredAt: new Date()
    });

    // Update match with last message info
    match.lastMessage = message._id;
    match.lastMessageAt = new Date();
    await match.save();

    // Populate sender info for response
    await message.populate('sender', 'profile.name profile.photos');

    res.status(201).json({
      success: true,
      message: {
        _id: message._id,
        content: message.content,
        messageType: message.messageType,
        sender: message.sender,
        createdAt: message.createdAt,
        isRead: message.isRead,
        isDelivered: message.isDelivered
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error sending message',
      error: error.message
    });
  }
});

// @desc    Get messages for a match
// @route   GET /api/messages/:matchId
// @access  Private
router.get('/:matchId', protect, async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify the match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isUserInMatch = match.users.some(userId => userId.toString() === req.user.id);
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    // Get messages for this match
    const messages = await Message.getMatchMessages(matchId, parseInt(page), parseInt(limit));

    // Mark messages as read for the current user
    await Message.markAsRead(matchId, userId);

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      count: messages.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages',
      error: error.message
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:matchId/read
// @access  Private
router.put('/:matchId/read', protect, async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const userId = req.user.id;

    // Verify the match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isUserInMatch = match.users.some(userId => userId.toString() === req.user.id);
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this match'
      });
    }

    // Mark messages as read
    const result = await Message.markAsRead(matchId, userId);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read',
      error: error.message
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Message.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count',
      error: error.message
    });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only allow sender to delete their own message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting message',
      error: error.message
    });
  }
});

module.exports = router;
