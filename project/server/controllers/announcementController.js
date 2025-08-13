const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's enrolled courses for filtering
    let userCourseIds = [];
    if (req.user.role === 'student') {
      const user = await User.findById(req.user._id).populate('enrolledCourses');
      userCourseIds = user.enrolledCourses.map(course => course._id);
    } else if (req.user.role === 'instructor') {
      const courses = await Course.find({ instructor: req.user._id });
      userCourseIds = courses.map(course => course._id);
    }

    // Use the static method to get announcements for user
    const announcements = await Announcement.getForUser(req.user._id, req.user.role, userCourseIds);

    // Apply additional filters
    let filteredAnnouncements = announcements;

    if (req.query.type) {
      filteredAnnouncements = filteredAnnouncements.filter(ann => ann.type === req.query.type);
    }

    if (req.query.priority) {
      filteredAnnouncements = filteredAnnouncements.filter(ann => ann.priority === req.query.priority);
    }

    if (req.query.courseId) {
      filteredAnnouncements = filteredAnnouncements.filter(ann => 
        ann.course && ann.course._id.toString() === req.query.courseId
      );
    }

    // Pagination
    const total = filteredAnnouncements.length;
    const paginatedAnnouncements = filteredAnnouncements.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: paginatedAnnouncements,
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
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'firstName lastName role')
      .populate('course', 'courseCode title')
      .populate('comments.author', 'firstName lastName role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user has access to this announcement
    let hasAccess = false;

    if (announcement.targetAudience === 'all') {
      hasAccess = true;
    } else if (announcement.targetAudience === req.user.role + 's') {
      hasAccess = true;
    } else if (announcement.targetAudience === 'specific_course' && announcement.course) {
      if (req.user.role === 'student') {
        const user = await User.findById(req.user._id).populate('enrolledCourses');
        hasAccess = user.enrolledCourses.some(course => 
          course._id.toString() === announcement.course._id.toString()
        );
      } else if (req.user.role === 'instructor') {
        const course = await Course.findById(announcement.course._id);
        hasAccess = course && course.instructor.toString() === req.user._id.toString();
      }
    }

    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read
    await announcement.markAsRead(req.user._id);

    res.status(200).json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement'
    });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Instructor/Admin)
const createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Set author to current user
    req.body.author = req.user._id;

    // Validate course access if specific course announcement
    if (req.body.targetAudience === 'specific_course' && req.body.course) {
      const course = await Course.findById(req.body.course);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only create announcements for your own courses'
        });
      }
    }

    const announcement = await Announcement.create(req.body);

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName role')
      .populate('course', 'courseCode title');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      if (announcement.targetAudience === 'specific_course' && announcement.course) {
        io.to(`course_${announcement.course}`).emit('new_announcement', populatedAnnouncement);
      } else {
        io.emit('new_announcement', populatedAnnouncement);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: populatedAnnouncement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Author/Admin)
const updateAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check ownership
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own announcements'
      });
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'firstName lastName role')
    .populate('course', 'courseCode title');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      if (announcement.targetAudience === 'specific_course' && announcement.course) {
        io.to(`course_${announcement.course._id}`).emit('announcement_updated', announcement);
      } else {
        io.emit('announcement_updated', announcement);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement'
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Author/Admin)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check ownership
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own announcements'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement'
    });
  }
};

// @desc    Mark announcement as read
// @route   POST /api/announcements/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.markAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Announcement marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking announcement as read'
    });
  }
};

// @desc    Pin/Unpin announcement
// @route   POST /api/announcements/:id/pin
// @access  Private (Author/Admin)
const togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check ownership
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only pin your own announcements'
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: announcement
    });

  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling pin status'
    });
  }
};

// @desc    Add comment to announcement
// @route   POST /api/announcements/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.addComment(req.user._id, content.trim());

    const updatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('comments.author', 'firstName lastName role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedAnnouncement
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding comment'
    });
  }
};

// @desc    Get recent announcements
// @route   GET /api/announcements/recent
// @access  Private
const getRecentAnnouncements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get user's enrolled courses for filtering
    let userCourseIds = [];
    if (req.user.role === 'student') {
      const user = await User.findById(req.user._id).populate('enrolledCourses');
      userCourseIds = user.enrolledCourses.map(course => course._id);
    } else if (req.user.role === 'instructor') {
      const courses = await Course.find({ instructor: req.user._id });
      userCourseIds = courses.map(course => course._id);
    }

    const announcements = await Announcement.getForUser(req.user._id, req.user.role, userCourseIds);
    const recentAnnouncements = announcements.slice(0, limit);

    res.status(200).json({
      success: true,
      data: recentAnnouncements
    });

  } catch (error) {
    console.error('Get recent announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent announcements'
    });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
  togglePin,
  addComment,
  getRecentAnnouncements
};