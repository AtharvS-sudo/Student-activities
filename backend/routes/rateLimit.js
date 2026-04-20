const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllBuckets, getBucketStats } = require('../middleware/rateLimiter');

// Get all rate limit buckets (admin only)
router.get('/buckets', protect, authorize('admin'), async (req, res) => {
  try {
    const buckets = getAllBuckets();
    
    res.json({
      success: true,
      count: buckets.length,
      buckets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get rate limit stats for specific identifier (admin only)
router.get('/buckets/:identifier', protect, authorize('admin'), async (req, res) => {
  try {
    const { identifier } = req.params;
    const stats = getBucketStats(identifier);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'No rate limit data found for this identifier',
      });
    }
    
    res.json({
      success: true,
      identifier,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
