const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  type: {
    type: String,
    enum: ['general', 'assignment', 'exam', 'schedule', 'emergency', 'reminder'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'specific_course'],
    default: 'all'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    description: String
  }],
  tags: [String],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  notificationSent: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
announcementSchema.index({ course: 1, publishDate: -1 });
announcementSchema.index({ author: 1 });
announcementSchema.index({ type: 1, priority: 1 });
announcementSchema.index({ targetAudience: 1, isPublished: 1 });
announcementSchema.index({ isPinned: 1, publishDate: -1 });

// Virtual for read count
announcementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Virtual for comment count
announcementSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for expired status
announcementSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Virtual for urgency score (for sorting)
announcementSchema.virtual('urgencyScore').get(function() {
  const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 };
  const pinnedBonus = this.isPinned ? 10 : 0;
  return priorityScores[this.priority] + pinnedBonus;
});

// Method to mark as read by user
announcementSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if user has read
announcementSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to add comment
announcementSchema.methods.addComment = function(authorId, content) {
  if (!this.allowComments) {
    throw new Error('Comments are not allowed on this announcement');
  }
  
  this.comments.push({
    author: authorId,
    content: content,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to edit comment
announcementSchema.methods.editComment = function(commentId, newContent, authorId) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  if (comment.author.toString() !== authorId.toString()) {
    throw new Error('You can only edit your own comments');
  }
  
  comment.content = newContent;
  comment.isEdited = true;
  comment.editedAt = new Date();
  
  return this.save();
};

// Method to delete comment
announcementSchema.methods.deleteComment = function(commentId, userId, userRole) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  // Allow deletion if user is the author or an admin/instructor
  const canDelete = comment.author.toString() === userId.toString() || 
                   ['admin', 'instructor'].includes(userRole);
  
  if (!canDelete) {
    throw new Error('You do not have permission to delete this comment');
  }
  
  comment.remove();
  return this.save();
};

// Static method to get announcements for user
announcementSchema.statics.getForUser = async function(userId, userRole, courseIds = []) {
  const query = {
    isPublished: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  };
  
  // Filter based on target audience
  if (userRole === 'student') {
    query.$and = [
      {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'students' },
          { targetAudience: 'specific_course', course: { $in: courseIds } }
        ]
      }
    ];
  } else if (userRole === 'instructor') {
    query.$and = [
      {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'instructors' },
          { targetAudience: 'specific_course', course: { $in: courseIds } }
        ]
      }
    ];
  }
  
  return await this.find(query)
    .populate('author', 'firstName lastName role')
    .populate('course', 'courseCode title')
    .sort({ isPinned: -1, priority: -1, publishDate: -1 });
};

// Pre-save middleware
announcementSchema.pre('save', function(next) {
  // Set expiry date for certain types if not set
  if (this.isNew && !this.expiryDate) {
    if (this.type === 'reminder') {
      // Reminders expire after 7 days
      this.expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (this.type === 'assignment') {
      // Assignment announcements expire after 30 days
      this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
  
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);