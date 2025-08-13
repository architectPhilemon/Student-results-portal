const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { paginationValidation, objectIdValidation } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Add filters
    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('enrolledCourses', 'courseCode title')
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin or own profile)
const getUser = async (req, res) => {
  try {
    // Check if user is accessing their own profile or is admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses', 'courseCode title instructor schedule')
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'instructor',
          select: 'firstName lastName email'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
const updateUser = async (req, res) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Define allowed fields based on role
    let allowedFields = ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'profilePicture'];
    
    if (req.user.role === 'admin') {
      allowedFields = [...allowedFields, 'role', 'department', 'year', 'isActive', 'emailVerified'];
    }

    // Filter request body to only include allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('enrolledCourses', 'courseCode title');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// @desc    Deactivate user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating user'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/statistics
// @access  Private (Admin)
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalInstructors = await User.countDocuments({ role: 'instructor', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });

    // Department distribution
    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        departmentStats,
        recentRegistrations
      }
    });

  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
};

// Routes
router.get('/', authorize('admin'), paginationValidation, getUsers);
router.get('/statistics', authorize('admin'), getUserStatistics);
router.get('/:id', objectIdValidation('id'), getUser);
router.put('/:id', objectIdValidation('id'), updateUser);
router.delete('/:id', objectIdValidation('id'), authorize('admin'), deactivateUser);

module.exports = router;