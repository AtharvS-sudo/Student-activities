const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, canPost } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { type, department, club } = req.query;

    let query = { isActive: true };

    if (type) {
      query.type = type;
    }
    if (department) {
      query.department = department;
    }
    if (club) {
      query.club = club;
    }

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category')
      .sort('-createdAt');

    res.json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
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

// Make sure this line is correct
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
      content, // Content is always required now
      format: format || 'text', // Default to text if not specified
      postedBy: req.user.id,
    };

    // If PDF file is attached, update format and add file data
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


router.put('/:id', protect, async (req, res) => {
  try {
    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    if (
      notice.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notice',
      });
    }

    const { title, content, isActive } = req.body;

    notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content, isActive },
      { new: true, runValidators: true }
    )
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category');

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

router.delete('/:id', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    if (
      notice.postedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
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
