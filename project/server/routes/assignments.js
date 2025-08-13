const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getUpcomingAssignments
} = require('../controllers/assignmentController');
const { auth, authorize } = require('../middleware/auth');

// Make sure these return actual middleware functions
const {
  assignmentValidation,
  paginationValidation,
  objectIdValidation
} = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Ensure validation middleware are used correctly
const validateObjectId = (param) => (req, res, next) => {
  const middleware = objectIdValidation(param);
  if (typeof middleware === 'function') return middleware(req, res, next);
  return res.status(500).json({ error: 'Invalid objectIdValidation usage' });
};

const validatePagination = (req, res, next) => {
  if (typeof paginationValidation === 'function') return paginationValidation(req, res, next);
  return res.status(500).json({ error: 'Invalid paginationValidation usage' });
};

const validateAssignment = (req, res, next) => {
  if (Array.isArray(assignmentValidation)) return assignmentValidation[0](req, res, next); // if it's an array
  if (typeof assignmentValidation === 'function') return assignmentValidation(req, res, next);
  return res.status(500).json({ error: 'Invalid assignmentValidation usage' });
};

// Authenticated routes
router.use(auth);

// General
router.get('/', validatePagination, getAssignments);
router.get('/upcoming', authorize('student'), getUpcomingAssignments);
router.get('/:id', validateObjectId('id'), getAssignment);

// Student
router.post('/:id/submit',
  validateObjectId('id'),
  authorize('student'),
  upload.array('attachments', 5),
  submitAssignment
);

// Instructor/Admin
router.post('/', authorize('instructor', 'admin'), validateAssignment, createAssignment);
router.put('/:id', validateObjectId('id'), authorize('instructor', 'admin'), validateAssignment, updateAssignment);
router.delete('/:id', validateObjectId('id'), authorize('instructor', 'admin'), deleteAssignment);
router.post('/:id/grade/:studentId',
  validateObjectId('id'),
  validateObjectId('studentId'),
  authorize('instructor', 'admin'),
  gradeSubmission
);

module.exports = router;
