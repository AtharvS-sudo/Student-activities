const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { chatRateLimiter } = require('../middleware/rateLimiter');

// Get chat messages for a club
router.get('/club/:clubId', protect, async (req, res) => {
  try {
    const { clubId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is a member of this club
    const user = await User.findById(req.user.id).populate('club');
    
    if (!user.club || user.club._id.toString() !== clubId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this club',
      });
    }

    const query = { club: clubId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .populate('sender', 'name email role additionalRoles')
      .sort('-timestamp')
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Send a chat message (also handled by Socket.IO, but this is a fallback)
router.post('/club/:clubId', protect, chatRateLimiter, async (req, res) => {
  try {
    const { clubId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    // Verify user is a member of this club
    const user = await User.findById(req.user.id).populate('club');
    
    if (!user.club || user.club._id.toString() !== clubId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this club',
      });
    }

    const chatMessage = await ChatMessage.create({
      club: clubId,
      sender: req.user.id,
      message: message.trim(),
      messageType: 'text',
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name email role additionalRoles');

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
