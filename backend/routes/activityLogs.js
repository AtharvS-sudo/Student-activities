const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// Get all activity logs (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { 
      action, 
      userId, 
      ipAddress, 
      startDate, 
      endDate, 
      limit = 100,
      page = 1 
    } = req.query;

    const query = {};
    
    if (action) query.action = action;
    if (userId) query.user = userId;
    if (ipAddress) query.ipAddress = { $regex: ipAddress, $options: 'i' };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'name email role')
        .sort('-timestamp')
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user's own activity logs
router.get('/my-activity', protect, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('Fetching activity logs for user:', req.user.id);

    // Exclude login/logout logs for non-admin users
    const query = { 
      user: req.user.id,
      action: { $nin: ['login', 'logout', 'failed_login'] }
    };

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort('-timestamp')
        .limit(parseInt(limit))
        .skip(skip),
      ActivityLog.countDocuments(query)
    ]);

    console.log(`Found ${logs.length} logs for user ${req.user.id}, total: ${total}`);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get activity statistics (admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const [
      totalLogs,
      actionStats,
      topUsers,
      topIPs,
      recentFailedLogins,
    ] = await Promise.all([
      ActivityLog.countDocuments(dateFilter),
      
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            count: 1,
            name: '$userInfo.name',
            email: '$userInfo.email',
          },
        },
      ]),
      
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      
      ActivityLog.find({ 
        action: 'failed_login',
        ...dateFilter 
      })
        .sort('-timestamp')
        .limit(10)
        .populate('user', 'name email'),
    ]);

    res.json({
      success: true,
      stats: {
        totalLogs,
        actionStats,
        topUsers,
        topIPs,
        recentFailedLogins,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get logs by IP address (admin only)
router.get('/by-ip/:ip', protect, authorize('admin'), async (req, res) => {
  try {
    const { ip } = req.params;
    const { limit = 50 } = req.query;

    const logs = await ActivityLog.find({ ipAddress: ip })
      .populate('user', 'name email role')
      .sort('-timestamp')
      .limit(parseInt(limit));

    res.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get logs by user (admin only)
router.get('/by-user/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await ActivityLog.find({ user: userId })
      .sort('-timestamp')
      .limit(parseInt(limit));

    const user = await require('../models/User').findById(userId).select('name email role');

    res.json({
      success: true,
      user,
      logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Debug endpoint - get all logs without filters (admin only)
router.get('/debug/all', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort('-timestamp')
      .limit(100);

    const count = await ActivityLog.countDocuments();

    res.json({
      success: true,
      totalCount: count,
      logs,
      message: `Found ${count} total logs in database`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
