const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for failed login attempts
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'create_notice',
      'edit_notice',
      'delete_notice',
      'pin_notice',
      'view_notice',
      'apply_club',
      'approve_application',
      'reject_application',
      'remove_member',
      'update_profile',
      'change_user_role',
      'grant_privileges',
      'delete_user',
      'failed_login',
    ],
  },
  resourceType: {
    type: String,
    enum: ['notice', 'user', 'club', 'application', 'auth', null],
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
  endpoint: {
    type: String,
  },
  statusCode: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
