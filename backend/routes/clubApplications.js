const express = require('express');
const router = express.Router();
const ClubApplication = require('../models/ClubApplication');
const { protect, authorize } = require('../middleware/auth');

// Get all applications (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const applications = await ClubApplication.find()
      .populate('club', 'name category')
      .populate('student', 'name email department')
      .populate('reviewedBy', 'name')
      .sort('-appliedAt');

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get applications for club head's club
router.get('/club-head', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('club');

    // Check if user is a club head
    if (!user.additionalRoles || !user.additionalRoles.includes('club_head')) {
      return res.status(403).json({
        success: false,
        message: 'Only club heads can access this route',
      });
    }

    if (!user.club) {
      return res.status(400).json({
        success: false,
        message: 'You are not assigned to any club',
      });
    }

    const applications = await ClubApplication.find({ club: user.club._id })
      .populate('club', 'name category')
      .populate('student', 'name email department')
      .populate('reviewedBy', 'name')
      .sort('-appliedAt');

    res.json({
      success: true,
      applications,
      club: user.club,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user's own applications
router.get('/my-applications', protect, async (req, res) => {
  try {
    const applications = await ClubApplication.find({ student: req.user.id })
      .populate('club', 'name category description')
      .sort('-appliedAt');

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Apply to a club
router.post('/', protect, async (req, res) => {
  try {
    const { club, reason } = req.body;

    if (!club || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide club and reason',
      });
    }

    // Check if already applied
    const existingApplication = await ClubApplication.findOne({
      club,
      student: req.user.id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this club or are already a member',
      });
    }

    const application = await ClubApplication.create({
      club,
      student: req.user.id,
      reason,
    });

    const populatedApplication = await ClubApplication.findById(application._id)
      .populate('club', 'name category description');

    res.status(201).json({
      success: true,
      application: populatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update application status (admin or club head)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const application = await ClubApplication.findById(req.params.id).populate('club');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization: admin or club head of the application's club
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('club');
    
    const isAdmin = user.role === 'admin';
    const isClubHead = user.additionalRoles && 
                       user.additionalRoles.includes('club_head') && 
                       user.club && 
                       user.club._id.toString() === application.club._id.toString();

    if (!isAdmin && !isClubHead) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this application',
      });
    }

    application.status = status;
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user.id;
    await application.save();

    // If approved, assign club_member role and assign club to the student
    if (status === 'approved') {
      const student = await User.findById(application.student);
      
      if (student) {
        // Add club_member to additionalRoles if not already present
        if (!student.additionalRoles) {
          student.additionalRoles = [];
        }
        
        if (!student.additionalRoles.includes('club_member')) {
          student.additionalRoles.push('club_member');
        }
        
        // Assign the club to the student
        student.club = application.club._id;
        
        await student.save();
      }
    }

    const updatedApplication = await ClubApplication.findById(application._id)
      .populate('club', 'name category')
      .populate('student', 'name email department')
      .populate('reviewedBy', 'name');

    res.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
