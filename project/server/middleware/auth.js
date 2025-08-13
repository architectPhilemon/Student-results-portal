const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized for this action.`
      });
    }

    next();
  };
};

// Check if user owns resource or is admin/instructor
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Instructors can access their own resources
    if (req.user.role === 'instructor' && req.resource && req.resource.instructor) {
      if (req.resource.instructor.toString() === req.user._id.toString()) {
        return next();
      }
    }

    // Students can only access their own resources
    if (req.resource && req.resource[resourceField]) {
      if (req.resource[resourceField].toString() === req.user._id.toString()) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

module.exports = { auth, authorize, checkOwnership };