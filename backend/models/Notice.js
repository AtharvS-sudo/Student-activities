const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a notice title'],
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['academic', 'club'],
    required: true,
  },
  format: {
    type: String,
    enum: ['text', 'pdf'],
    required: true,
  },
  pdfFile: {
    filename: String,
    path: String,
    size: Number,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isPinned: {
      type: Boolean,
      default: false,
    },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

noticeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Notice', noticeSchema);
