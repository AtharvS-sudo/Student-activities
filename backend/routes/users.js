const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('department')
      .populate('club')
      .select('-password');

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/:id/privileges', protect, authorize('admin'), async (req, res) => {
  try {
    const { canPost } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { canPost },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'faculty', 'club_member', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/:id/additional-roles', protect, authorize('admin'), async (req, res) => {
  try {
    const { additionalRoles } = req.body;

    // Validate additional roles
    const validRoles = ['club_member', 'club_head'];
    const invalidRoles = additionalRoles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid additional roles',
      });
    }

    // If user is being made a club head, enable canPost automatically
    const updateData = { additionalRoles };
    if (additionalRoles.includes('club_head')) {
      updateData.canPost = true;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('department')
      .populate('club')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { club } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { club },
      { new: true, runValidators: true }
    )
      .populate('department')
      .populate('club')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get club members (for club heads)
router.get('/club-members/:clubId', protect, async (req, res) => {
  try {
    const { clubId } = req.params;

    // Verify user is club head of this club
    const currentUser = await User.findById(req.user.id).populate('club');
    
    const isAdmin = currentUser.role === 'admin';
    const isClubHead = currentUser.additionalRoles && 
                       currentUser.additionalRoles.includes('club_head') && 
                       currentUser.club && 
                       currentUser.club._id.toString() === clubId;

    if (!isAdmin && !isClubHead) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view club members',
      });
    }

    // Get all members of the club
    const members = await User.find({ 
      club: clubId,
      additionalRoles: 'club_member'
    })
      .populate('department', 'name code')
      .select('-password')
      .sort('name');

    res.json({
      success: true,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Remove member from club (for club heads)
router.delete('/club-members/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the member to be removed
    const member = await User.findById(userId).populate('club');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify user is club head of this member's club
    const currentUser = await User.findById(req.user.id).populate('club');
    
    const isAdmin = currentUser.role === 'admin';
    const isClubHead = currentUser.additionalRoles && 
                       currentUser.additionalRoles.includes('club_head') && 
                       currentUser.club && 
                       member.club &&
                       currentUser.club._id.toString() === member.club._id.toString();

    if (!isAdmin && !isClubHead) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this member',
      });
    }

    // Remove club_member from additionalRoles and unassign club
    member.additionalRoles = member.additionalRoles.filter(role => role !== 'club_member');
    member.club = null;
    await member.save();

    res.json({
      success: true,
      message: 'Member removed from club successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
