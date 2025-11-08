const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize, canPost } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all notices (pinned first)
router.get('/', protect, async (req, res) => {
  try {
    const { type, department, club } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (department) query.department = department;
    if (club) query.club = club;

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category')
      .sort({ isPinned: -1, createdAt: -1 }); // Pinned first, then by date

    res.json({
      success: true,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get single notice
router.get('/:id', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.json({
      success: true,
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create notice
router.post('/', protect, canPost, upload.single('pdfFile'), async (req, res) => {
  try {
    const { title, content, type, format, department, club } = req.body;

    if (!title || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, type, and content',
      });
    }

    const noticeData = {
      title,
      type,
      content,
      format: format || 'text',
      postedBy: req.user.id,
    };

    if (req.file) {
      noticeData.format = 'pdf';
      noticeData.pdfFile = {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      };
    }

    if (type === 'academic' && department) {
      noticeData.department = department;
    } else if (type === 'club' && club) {
      noticeData.club = club;
    }

    const notice = await Notice.create(noticeData);

    const populatedNotice = await Notice.findById(notice._id)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category');

    res.status(201).json({
      success: true,
      notice: populatedNotice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PIN/UNPIN NOTICE (ADMIN ONLY) - NEW
router.patch('/:id/pin', protect, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();

    const updatedNotice = await Notice.findById(notice._id)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category');

    res.json({
      success: true,
      message: `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully`,
      notice: updatedNotice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete notice
router.delete('/:id', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notice',
      });
    }

    await notice.deleteOne();

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
