const express = require('express');
const { body } = require('express-validator'); 
const {
  getGrades,
  getGrade,
  updateGrade,
  addGradeComment,
  flagGrade,
  getGradeStatistics,
  calculateGPA
} = require('../controllers/gradeController');
const { auth, authorize } = require('../middleware/auth');
const { gradeValidation, paginationValidation, objectIdValidation } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// General routes
router.get('/', paginationValidation, getGrades);
router.get('/statistics', getGradeStatistics);
router.get('/gpa/:studentId?', calculateGPA);
router.get('/:id', objectIdValidation('id'), getGrade);

// Student routes
router.post('/:id/flag', 
  objectIdValidation('id'), 
  authorize('student'), 
  [
    body('type').isIn(['regrade_request', 'academic_integrity', 'incomplete', 'extra_credit']),
    body('description').isLength({ min: 10, max: 500 })
  ],
  flagGrade
);

// General comment route (students and instructors)
router.post('/:id/comments', 
  objectIdValidation('id'), 
  [body('content').isLength({ min: 1, max: 500 })],
  addGradeComment
);

// Instructor/Admin routes
router.put('/:id', objectIdValidation('id'), authorize('instructor', 'admin'), gradeValidation, updateGrade);

module.exports = router;