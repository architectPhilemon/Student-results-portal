const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/courseController');
const { auth, authorize } = require('../middleware/auth');
const { courseValidation, paginationValidation, objectIdValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', paginationValidation, getCourses);
router.get('/:id', objectIdValidation('id'), getCourse);

// Protected routes
router.use(auth); // All routes below require authentication

// Student routes
router.get('/enrolled/my', authorize('student'), getEnrolledCourses);
router.post('/:id/enroll', objectIdValidation('id'), authorize('student'), enrollInCourse);
router.post('/:id/drop', objectIdValidation('id'), authorize('student'), dropCourse);

// Instructor routes
router.get('/instructor/my', authorize('instructor', 'admin'), getInstructorCourses);
router.get('/:id/students', objectIdValidation('id'), authorize('instructor', 'admin'), getCourseStudents);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), courseValidation, createCourse);
router.put('/:id', objectIdValidation('id'), authorize('instructor', 'admin'), courseValidation, updateCourse);
router.delete('/:id', objectIdValidation('id'), authorize('instructor', 'admin'), deleteCourse);

module.exports = router;