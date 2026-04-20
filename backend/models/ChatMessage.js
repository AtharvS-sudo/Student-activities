const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
});

// Index for faster queries
chatMessageSchema.index({ club: 1, timestamp: -1 });
chatMessageSchema.index({ sender: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
