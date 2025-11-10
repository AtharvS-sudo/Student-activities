const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize, canPost } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all notices (pinned first)
router.get('/', protect, async (req, res) => {
  try {
    const { type, department, club } = req.query;
    
    // Get user with department populated
    const user = await require('../models/User').findById(req.user.id).populate('department');
    
    let query = {};
    
    if (type) query.type = type;
    if (department) query.department = department;
    if (club) query.club = club;

    // If user is a student, filter academic notices
    if (user.role === 'student' && (!type || type === 'academic')) {
      // Students can only see:
      // 1. Academic notices from their department
      // 2. Academic notices with no department (general notices)
      // 3. All club notices
      
      if (type === 'academic') {
        // Only academic notices requested
        query.$or = [
          { type: 'academic', department: null }, // General academic notices
          { type: 'academic', department: user.department?._id } // Their department notices
        ];
      } else {
        // All notices requested - filter academic ones
        query.$or = [
          { type: 'club' }, // All club notices
          { type: 'academic', department: null }, // General academic notices
          { type: 'academic', department: user.department?._id } // Their department notices
        ];
      }
    }

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

    // Get user with department populated
    const user = await require('../models/User').findById(req.user.id).populate('department');

    // If user is a student and notice is academic, check department access
    if (user.role === 'student' && notice.type === 'academic') {
      // Students can only view academic notices from their department or general notices
      if (notice.department && notice.department._id.toString() !== user.department?._id?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this notice',
        });
      }
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

// Update/Edit notice
router.put('/:id', protect, canPost, async (req, res) => {
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
        message: 'Not authorized to edit this notice',
      });
    }

    const { title, content, type, department, club } = req.body;

    if (title) notice.title = title;
    if (content) notice.content = content;
    if (type) notice.type = type;
    if (department !== undefined) notice.department = department || null;
    if (club !== undefined) notice.club = club || null;

    await notice.save();

    const updatedNotice = await Notice.findById(notice._id)
      .populate('postedBy', 'name role')
      .populate('department', 'name code')
      .populate('club', 'name category');

    res.json({
      success: true,
      message: 'Notice updated successfully',
      notice: updatedNotice,
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
