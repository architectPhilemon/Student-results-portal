const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      year,
      phone,
      address,
      dateOfBirth
    } = req.body;

    role = role || 'student';

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Generate studentId or employeeId
    let studentId = null;
    let employeeId = null;

    if (role === 'student') {
      if (!year) {
        return res.status(400).json({ success: false, message: 'Year is required for students' });
      }
      studentId = `STU${Date.now().toString().slice(-6)}`;
    } else {
      employeeId = `EMP${Date.now().toString().slice(-6)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department,
      year: role === 'student' ? year : null,
      studentId,
      employeeId,
      phone,
      address,
      dateOfBirth,
      emailVerified: true
    });

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        studentId: user.studentId,
        employeeId: user.employeeId,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        enrolledCourses: user.enrolledCourses
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ... keep login, getMe, updateProfile, changePassword, logout as before

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};
