const express = require('express');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
  togglePin,
  addComment,
  getRecentAnnouncements
} = require('../controllers/announcementController');
const { auth, authorize } = require('../middleware/auth');
const { announcementValidation, paginationValidation, objectIdValidation } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// General routes
router.get('/', paginationValidation, getAnnouncements);
router.get('/recent', getRecentAnnouncements);
router.get('/:id', objectIdValidation('id'), getAnnouncement);
router.post('/:id/read', objectIdValidation('id'), markAsRead);
router.post('/:id/comments', objectIdValidation('id'), addComment);

// Instructor/Admin routes
router.post('/', authorize('instructor', 'admin'), announcementValidation, createAnnouncement);
router.put('/:id', objectIdValidation('id'), authorize('instructor', 'admin'), announcementValidation, updateAnnouncement);
router.delete('/:id', objectIdValidation('id'), authorize('instructor', 'admin'), deleteAnnouncement);
router.post('/:id/pin', objectIdValidation('id'), authorize('instructor', 'admin'), togglePin);

module.exports = router;