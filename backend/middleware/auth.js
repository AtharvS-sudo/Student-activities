const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Authorization Header:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted:', typeof token === 'string' ? token.substring(0, 20) + '...' : token);

  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, User ID:', decoded.id);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== AUTHORIZATION CHECK ===');
    console.log('Required roles:', roles);
    console.log('User role:', req.user.role);
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ User role not authorized');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    
    console.log('✅ User authorized');
    next();
  };
};

exports.canPost = async (req, res, next) => {
  console.log('=== CAN POST CHECK ===');
  console.log('User role:', req.user.role);
  console.log('Can post:', req.user.canPost);
  
  if (!req.user.canPost && req.user.role !== 'admin') {
    console.log('❌ User cannot post');
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to post notices',
    });
  }
  
  console.log('✅ User can post');
  next();
};
