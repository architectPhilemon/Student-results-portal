const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const nameValidation = (field) => body(field)
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage(`${field} must be between 2 and 50 characters`)
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage(`${field} must contain only letters and spaces`);

const objectIdValidation = (field) => param(field)
  .isMongoId()
  .withMessage(`Invalid ${field} ID format`);

// User validation
const registerValidation = [
  nameValidation('firstName'),
  nameValidation('lastName'),
  emailValidation,
  passwordValidation,
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
  body('department')
    .isIn(['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Business', 'Engineering', 'Psychology'])
    .withMessage('Please select a valid department'),
  body('year')
    .if(body('role').equals('student'))
    .isIn(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'])
    .withMessage('Please select a valid year'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const loginValidation = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Course validation
const courseValidation = [
  body('courseCode')
    .matches(/^[A-Z]{2,4}\d{3,4}$/)
    .withMessage('Course code must be in format like CS101 or MATH1001'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Course title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Course description must be between 20 and 1000 characters'),
  body('credits')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('capacity')
    .isInt({ min: 1, max: 500 })
    .withMessage('Capacity must be between 1 and 500'),
  body('semester')
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Semester must be Fall, Spring, or Summer'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  handleValidationErrors
];

// Assignment validation (UPDATED to match the frontend form)
const assignmentValidation = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),
  body('description')
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters.'),
  body('instructions')
    .optional()
    .isString()
    .trim()
    .withMessage('Instructions must be a string.'),
  body('course')
    .isMongoId()
    .withMessage('Invalid course ID format.'),
  body('type')
    .isIn(['homework', 'quiz', 'project', 'essay', 'exam', 'lab', 'presentation', 'discussion'])
    .withMessage('Invalid assignment type.'),
  body('totalPoints')
    .isFloat({ min: 1 })
    .withMessage('Total points must be a positive number.'),
  body('dueDate')
    .isISO8601()
    .toDate()
    .withMessage('Invalid due date format.'),
  body('allowLateSubmission')
    .isBoolean()
    .withMessage('Allow late submission must be a boolean.'),
  body('latePenalty')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Late penalty must be a number between 0 and 100.'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attempts must be an integer greater than 0.'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be an integer greater than 0.'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Invalid difficulty level.'),
  body('isPublished')
    .isBoolean()
    .withMessage('Is published must be a boolean.'),
  handleValidationErrors // Final handler for all validation errors
];

// Grade validation
const gradeValidation = [
  body('points')
    .isNumeric()
    .withMessage('Points must be a number')
    .custom((value, { req }) => {
      if (value < 0 || value > req.body.totalPoints) {
        throw new Error('Points must be between 0 and total points');
      }
      return true;
    }),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
  handleValidationErrors
];

// Announcement validation
const announcementValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Announcement title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Announcement content must be between 10 and 5000 characters'),
  body('type')
    .isIn(['general', 'assignment', 'exam', 'schedule', 'emergency', 'reminder'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('targetAudience')
    .isIn(['all', 'students', 'instructors', 'specific_course'])
    .withMessage('Invalid target audience'),
  handleValidationErrors
];

// Query validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  courseValidation,
  assignmentValidation,
  gradeValidation,
  announcementValidation,
  paginationValidation,
  objectIdValidation,
  emailValidation,
  passwordValidation,
  nameValidation
};
