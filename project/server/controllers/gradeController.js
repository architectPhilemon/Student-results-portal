const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get grades
// @route   GET /api/grades
// @access  Private
const getGrades = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter based on user role
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'instructor') {
      query.instructor = req.user._id;
    }

    // Additional filters
    if (req.query.courseId) {
      query.course = req.query.courseId;
    }

    if (req.query.studentId && req.user.role !== 'student') {
      query.student = req.query.studentId;
    }

    if (req.query.assignmentId) {
      query.assignment = req.query.assignmentId;
    }

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName email studentId')
      .populate('course', 'courseCode title')
      .populate('assignment', 'title type totalPoints dueDate')
      .populate('instructor', 'firstName lastName')
      .sort({ gradedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Grade.countDocuments(query);

    res.status(200).json({
      success: true,
      data: grades,
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
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grades'
    });
  }
};

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private
const getGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'firstName lastName email studentId')
      .populate('course', 'courseCode title')
      .populate('assignment', 'title type totalPoints dueDate rubric')
      .populate('instructor', 'firstName lastName')
      .populate('comments.author', 'firstName lastName role');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student' && grade.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own grades.'
      });
    }

    if (req.user.role === 'instructor' && grade.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view grades for your assignments.'
      });
    }

    res.status(200).json({
      success: true,
      data: grade
    });

  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grade'
    });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Instructor/Admin)
const updateGrade = async (req, res) => {
  try {
    const { points, feedback, rubricScores } = req.body;

    let grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check ownership
    if (grade.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update grades for your own assignments'
      });
    }

    // Update grade
    if (points !== undefined) grade.points = points;
    if (feedback !== undefined) grade.feedback = feedback;
    if (rubricScores !== undefined) grade.rubricScores = rubricScores;

    grade.lastModified = new Date();
    grade.version += 1;

    await grade.save();

    const updatedGrade = await Grade.findById(grade._id)
      .populate('student', 'firstName lastName email studentId')
      .populate('course', 'courseCode title')
      .populate('assignment', 'title type totalPoints')
      .populate('instructor', 'firstName lastName');

    // Emit real-time event to student
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${grade.student._id}`).emit('grade_updated', {
        gradeId: grade._id,
        assignmentTitle: updatedGrade.assignment.title,
        newGrade: grade.points,
        totalPoints: grade.totalPoints,
        feedback: grade.feedback
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      data: updatedGrade
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating grade'
    });
  }
};

// @desc    Add grade comment
// @route   POST /api/grades/:id/comments
// @access  Private
const addGradeComment = async (req, res) => {
  try {
    const { content, isPrivate } = req.body;

    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check access permissions
    const canComment = req.user.role === 'admin' ||
                      grade.instructor.toString() === req.user._id.toString() ||
                      grade.student.toString() === req.user._id.toString();

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await grade.addComment(req.user._id, content, isPrivate || false);

    const updatedGrade = await Grade.findById(grade._id)
      .populate('comments.author', 'firstName lastName role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedGrade
    });

  } catch (error) {
    console.error('Add grade comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// @desc    Flag grade for review
// @route   POST /api/grades/:id/flag
// @access  Private (Student)
const flagGrade = async (req, res) => {
  try {
    const { type, description } = req.body;

    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Only students can flag their own grades
    if (req.user.role !== 'student' || grade.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only students can flag their own grades'
      });
    }

    await grade.addFlag(type, description, req.user._id);

    // Notify instructor
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${grade.instructor}`).emit('grade_flagged', {
        gradeId: grade._id,
        studentName: `${req.user.firstName} ${req.user.lastName}`,
        flagType: type,
        description: description
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grade flagged for review'
    });

  } catch (error) {
    console.error('Flag grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while flagging grade'
    });
  }
};

// @desc    Get grade statistics
// @route   GET /api/grades/statistics
// @access  Private
const getGradeStatistics = async (req, res) => {
  try {
    let query = {};

    if (req.query.courseId) {
      query.course = req.query.courseId;
    }

    if (req.user.role === 'instructor') {
      query.instructor = req.user._id;
    } else if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const grades = await Grade.find(query);

    if (grades.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          average: 0,
          median: 0,
          highest: 0,
          lowest: 0,
          distribution: {},
          totalGrades: 0,
          passingRate: 0
        }
      });
    }

    const percentages = grades.map(grade => grade.percentage).sort((a, b) => a - b);
    const total = percentages.length;

    // Calculate statistics
    const average = percentages.reduce((sum, p) => sum + p, 0) / total;
    const median = total % 2 === 0 
      ? (percentages[total / 2 - 1] + percentages[total / 2]) / 2
      : percentages[Math.floor(total / 2)];
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    // Grade distribution
    const distribution = grades.reduce((dist, grade) => {
      const letter = grade.letterGrade;
      dist[letter] = (dist[letter] || 0) + 1;
      return dist;
    }, {});

    // Passing rate (assuming 60% is passing)
    const passingGrades = percentages.filter(p => p >= 60).length;
    const passingRate = (passingGrades / total) * 100;

    res.status(200).json({
      success: true,
      data: {
        average: Math.round(average * 100) / 100,
        median: Math.round(median * 100) / 100,
        highest,
        lowest,
        distribution,
        totalGrades: total,
        passingRate: Math.round(passingRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get grade statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating statistics'
    });
  }
};

// @desc    Calculate GPA
// @route   GET /api/grades/gpa/:studentId?
// @access  Private
const calculateGPA = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;

    // Check permissions
    if (req.user.role === 'student' && studentId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own GPA'
      });
    }

    const grades = await Grade.find({ student: studentId })
      .populate('course', 'credits')
      .populate('assignment', 'type');

    if (grades.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          currentGPA: 0,
          cumulativeGPA: 0,
          totalCredits: 0,
          gradeDistribution: {}
        }
      });
    }

    // Group grades by course and calculate course averages
    const courseGrades = {};
    grades.forEach(grade => {
      const courseId = grade.course._id.toString();
      if (!courseGrades[courseId]) {
        courseGrades[courseId] = {
          grades: [],
          credits: grade.course.credits || 3
        };
      }
      courseGrades[courseId].grades.push(grade.percentage);
    });

    // Calculate GPA
    let totalPoints = 0;
    let totalCredits = 0;
    const gradeDistribution = {};

    Object.values(courseGrades).forEach(course => {
      const average = course.grades.reduce((sum, g) => sum + g, 0) / course.grades.length;
      const letterGrade = getLetterGrade(average);
      const gradePoints = getGradePoints(letterGrade);
      
      totalPoints += gradePoints * course.credits;
      totalCredits += course.credits;
      
      gradeDistribution[letterGrade] = (gradeDistribution[letterGrade] || 0) + 1;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Update user's GPA
    await User.findByIdAndUpdate(studentId, { gpa: Math.round(gpa * 100) / 100 });

    res.status(200).json({
      success: true,
      data: {
        currentGPA: Math.round(gpa * 100) / 100,
        cumulativeGPA: Math.round(gpa * 100) / 100,
        totalCredits,
        gradeDistribution
      }
    });

  } catch (error) {
    console.error('Calculate GPA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating GPA'
    });
  }
};

// Helper functions
const getLetterGrade = (percentage) => {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
};

const getGradePoints = (letterGrade) => {
  const gradeScale = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeScale[letterGrade] || 0;
};

module.exports = {
  getGrades,
  getGrade,
  updateGrade,
  addGradeComment,
  flagGrade,
  getGradeStatistics,
  calculateGPA
};