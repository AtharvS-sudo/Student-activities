const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['student', 'faculty', 'club_member'])
      .withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role, department, club } = req.body;

      // Validate faculty email domain
      if (role === 'faculty' && !email.endsWith('@vit.edu')) {
        return res.status(400).json({
          success: false,
          message: 'Faculty email must end with @vit.edu',
        });
      }

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      user = await User.create({
        name,
        email,
        password,
        role,
        department,
        club,
        canPost: role === 'faculty' ? true : false,
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          additionalRoles: user.additionalRoles || [],
          canPost: user.canPost,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email })
        .select('+password')
        .populate('department')
        .populate('club');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Validate faculty email domain
      if (user.role === 'faculty' && !email.endsWith('@vit.edu')) {
        return res.status(403).json({
          success: false,
          message: 'Faculty email must end with @vit.edu',
        });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          additionalRoles: user.additionalRoles || [],
          department: user.department,
          club: user.club,
          canPost: user.canPost,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department')
      .populate('club');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        additionalRoles: user.additionalRoles || [],
        department: user.department,
        club: user.club,
        canPost: user.canPost,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;
