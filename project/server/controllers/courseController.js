const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Add filters
    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.semester) {
      query.semester = req.query.semester;
    }

    if (req.query.year) {
      query.year = parseInt(req.query.year);
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { courseCode: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .populate('enrolledStudents.student', 'firstName lastName email')
      .sort({ courseCode: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
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
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email department')
      .populate('enrolledStudents.student', 'firstName lastName email studentId');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Set instructor to current user if not provided
    if (!req.body.instructor) {
      req.body.instructor = req.user._id;
    }

    // Only admins can assign courses to other instructors
    if (req.body.instructor !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only create courses for yourself'
      });
    }

    const course = await Course.create(req.body);

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'firstName lastName email');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('course_created', {
        course: populatedCourse,
        createdBy: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName email');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`course_${course._id}`).emit('course_updated', {
        course,
        updatedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own courses'
      });
    }

    // Soft delete by setting isActive to false
    course.isActive = false;
    await course.save();

    // Remove course from enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not active'
      });
    }

    // Check if already enrolled
    if (course.isStudentEnrolled(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check capacity
    if (course.enrollmentCount >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Course is at full capacity'
      });
    }

    // Enroll student
    await course.enrollStudent(req.user._id);

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { enrolledCourses: course._id } }
    );

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`course_${course._id}`).emit('student_enrolled', {
        courseId: course._id,
        studentId: req.user._id,
        studentName: `${req.user.firstName} ${req.user.lastName}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });

  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while enrolling in course'
    });
  }
};

// @desc    Drop course
// @route   POST /api/courses/:id/drop
// @access  Private (Student)
const dropCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrolled
    if (!course.isStudentEnrolled(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Drop student
    await course.dropStudent(req.user._id);

    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { enrolledCourses: course._id } }
    );

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`course_${course._id}`).emit('student_dropped', {
        courseId: course._id,
        studentId: req.user._id,
        studentName: `${req.user.firstName} ${req.user.lastName}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully dropped course'
    });

  } catch (error) {
    console.error('Drop course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while dropping course'
    });
  }
};

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private (Student)
const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses',
        populate: {
          path: 'instructor',
          select: 'firstName lastName email'
        }
      });

    res.status(200).json({
      success: true,
      data: user.enrolledCourses
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrolled courses'
    });
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor
// @access  Private (Instructor)
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      instructor: req.user._id,
      isActive: true 
    })
    .populate('enrolledStudents.student', 'firstName lastName email studentId')
    .sort({ courseCode: 1 });

    res.status(200).json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching instructor courses'
    });
  }
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private (Instructor/Admin)
const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.student', 'firstName lastName email studentId gpa');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is instructor of this course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const enrolledStudents = course.enrolledStudents
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment => ({
        ...enrollment.student.toObject(),
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status
      }));

    res.status(200).json({
      success: true,
      data: enrolledStudents
    });

  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course students'
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  dropCourse,
  getEnrolledCourses,
  getInstructorCourses,
  getCourseStudents
};