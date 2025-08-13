const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

/**
 * A helper function to safely find a submission for a specific user
 * within an assignment's submissions array.
 * @param {object} assignment The assignment object, potentially from a Mongoose query
 * @param {string} userId The ID of the student to search for
 * @returns {object|null} The submission object or null if not found
 */
const getSubmissionForUser = (assignment, userId) => {
  return assignment.submissions?.find(sub => sub.student?.toString() === userId.toString());
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  let query = { isPublished: true };
  const userRole = req.user.role;
  const userId = req.user._id;

  // Determine the base query based on the user's role
  if (userRole === 'student') {
    const user = await User.findById(userId).populate('enrolledCourses', '_id').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    // Defensive check: Use optional chaining to safely map over enrolledCourses
    const enrolledCourseIds = user.enrolledCourses?.map(course => course._id) ?? [];
    query.course = { $in: enrolledCourseIds };
  } else if (userRole === 'instructor') {
    query.instructor = userId;
  }

  // Apply additional query filters from the request
  if (req.query.courseId) query.course = req.query.courseId;
  if (req.query.type) query.type = req.query.type;
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Fetch all assignments first, then filter in memory for status
  let assignments = await Assignment.find(query)
    .populate('course', 'courseCode title')
    .populate('instructor', 'firstName lastName')
    .sort({ dueDate: 1 })
    .lean();

  // Defensive check in case no assignments are found
  if (!assignments) {
    assignments = [];
  }

  // Now, apply in-memory filtering for student status to avoid Mongoose query issues
  if (userRole === 'student' && req.query.status) {
    assignments = assignments.filter(assignment => {
      const userSubmission = getSubmissionForUser(assignment, userId);
      const isOverdue = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;
      const hasSubmission = !!userSubmission;
      const isGraded = hasSubmission && userSubmission.grade !== undefined && userSubmission.grade !== null;

      switch (req.query.status) {
        case 'pending':
          return !hasSubmission && !isOverdue;
        case 'submitted':
          return hasSubmission && !isGradue;
        case 'graded':
          return isGraded;
        case 'overdue':
          return isOverdue && !hasSubmission;
        default:
          return true;
      }
    });
  }

  // Handle pagination on the filtered results
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const paginatedAssignments = assignments.slice(skip, skip + limit);
  const total = assignments.length;

  res.status(200).json({
    success: true,
    data: paginatedAssignments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'courseCode title')
    .populate('instructor', 'firstName lastName email')
    .populate('submissions.student', 'firstName lastName email studentId')
    .populate('submissions.gradedBy', 'firstName lastName')
    .lean();

  if (!assignment) {
    res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
    return;
  }

  // Check access permissions
  if (req.user.role === 'student') {
    const user = await User.findById(req.user._id).populate('enrolledCourses').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isEnrolled = user.enrolledCourses?.some(course =>
      course._id?.toString() === assignment.course?._id?.toString()
    );

    if (!isEnrolled) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You are not enrolled in this course.'
      });
      return;
    }

    assignment.submissions = assignment.submissions?.filter(
      sub => sub.student?._id?.toString() === req.user._id?.toString()
    );
  } else if (req.user.role === 'instructor') {
    if (assignment.instructor?._id?.toString() !== req.user._id?.toString()) {
      res.status(403).json({
        success: false,
      message: 'Access denied. You can only view your own assignments.'
      });
      return;
    }
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Instructor/Admin)
const createAssignment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { course: courseIdOrCode, ...restOfBody } = req.body;

  let course;
  if (!courseIdOrCode) {
    return res.status(400).json({
      success: false,
      message: 'Course ID or code is required'
    });
  }

  if (courseIdOrCode.match(/^[0-9a-fA-F]{24}$/)) {
    course = await Course.findById(courseIdOrCode).lean();
  } else {
    course = await Course.findOne({ courseCode: courseIdOrCode }).lean();
  }

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.instructor?.toString() !== req.user._id?.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only create assignments for your own courses'
    });
  }

  const assignmentData = { ...restOfBody, course: course._id, instructor: req.user._id };
  const assignment = await Assignment.create(assignmentData);

  const populatedAssignment = await Assignment.findById(assignment._id)
    .populate('course', 'courseCode title')
    .populate('instructor', 'firstName lastName')
    .lean();

  const io = req.app.get('io');
  if (io) {
    io.to(`course_${course._id}`).emit('assignment_created', {
      assignment: populatedAssignment,
      courseId: course._id
    });
  }

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: populatedAssignment
  });
});


// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Instructor/Admin)
const updateAssignment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }

  let assignment = await Assignment.findById(req.params.id).lean();

  if (!assignment) {
    res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
    return;
  }

  if (assignment.instructor?.toString() !== req.user._id?.toString() && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only update your own assignments'
    });
    return;
  }

  assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
  .populate('course', 'courseCode title')
  .populate('instructor', 'firstName lastName')
  .lean();

  const io = req.app.get('io');
  if (io) {
    io.to(`course_${assignment.course._id}`).emit('assignment_updated', {
      assignment,
      updatedBy: req.user._id
    });
  }

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Instructor/Admin)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).lean();

  if (!assignment) {
    res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
    return;
  }

  if (assignment.instructor?.toString() !== req.user._id?.toString() && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only delete your own assignments'
    });
    return;
  }

  await Assignment.findByIdAndDelete(req.params.id);

  await Grade.deleteMany({ assignment: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).lean();

  if (!assignment) {
    res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
    return;
  }

  if (!assignment.isPublished) {
    res.status(400).json({
      success: false,
      message: 'Assignment is not published yet'
    });
    return;
  }

  const user = await User.findById(req.user._id).populate('enrolledCourses').lean();

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const isEnrolled = user.enrolledCourses?.some(course =>
    course._id?.toString() === assignment.course?.toString()
  );

  if (!isEnrolled) {
    res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
    return;
  }

  const submissionData = {
    content: req.body.content,
    attachments: req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : []
  };

  await assignment.submitAssignment(req.user._id, submissionData);

  const io = req.app.get('io');
  if (io) {
    io.to(`user_${assignment.instructor}`).emit('assignment_submitted', {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      studentId: req.user._id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      submittedAt: new Date()
    });
  }

  res.status(200).json({
    success: true,
    message: 'Assignment submitted successfully'
  });
});

// @desc    Grade assignment submission
// @route   POST /api/assignments/:id/grade/:studentId
// @access  Private (Instructor/Admin)
const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback, rubricScores } = req.body;
  const assignment = await Assignment.findById(req.params.id).lean();

  if (!assignment) {
    res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
    return;
  }

  if (assignment.instructor?.toString() !== req.user._id?.toString() && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only grade your own assignments'
    });
    return;
  }

  await assignment.gradeSubmission(req.params.studentId, grade, feedback, req.user._id);

  const existingGrade = await Grade.findOne({
    student: req.params.studentId,
    assignment: assignment._id
  });

  if (existingGrade) {
    existingGrade.points = grade;
    existingGrade.feedback = feedback;
    existingGrade.rubricScores = rubricScores || [];
    existingGrade.gradedBy = req.user._id;
    existingGrade.gradedDate = new Date();
    await existingGrade.save();
  } else {
    await Grade.create({
      student: req.params.studentId,
      course: assignment.course,
      assignment: assignment._id,
      instructor: req.user._id,
      points: grade,
      totalPoints: assignment.totalPoints,
      feedback: feedback,
      rubricScores: rubricScores || [],
      gradedBy: req.user._id
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`user_${req.params.studentId}`).emit('assignment_graded', {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      grade: grade,
      totalPoints: assignment.totalPoints,
      feedback: feedback
    });
  }

  res.status(200).json({
    success: true,
    message: 'Assignment graded successfully'
  });
});

// @desc    Get upcoming assignments
// @route   GET /api/assignments/upcoming
// @access  Private (Student)
const getUpcomingAssignments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('enrolledCourses').lean();
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const enrolledCourseIds = user.enrolledCourses?.map(course => course._id);

  const assignments = await Assignment.find({
    course: { $in: enrolledCourseIds },
    isPublished: true,
    dueDate: { $gt: new Date() }
  })
  .populate('course', 'courseCode title')
  .sort({ dueDate: 1 })
  .limit(10)
  .lean();

  res.status(200).json({
    success: true,
    data: assignments
  });
});

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getUpcomingAssignments
};
