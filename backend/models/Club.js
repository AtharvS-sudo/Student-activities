const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide club name'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'social', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Club', clubSchema);
