const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  rubricScores: [{
    criteria: String,
    points: Number,
    maxPoints: Number,
    feedback: String
  }],
  isExcused: {
    type: Boolean,
    default: false
  },
  isLate: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  submissionDate: Date,
  gradedDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  flags: [{
    type: {
      type: String,
      enum: ['regrade_request', 'academic_integrity', 'incomplete', 'extra_credit']
    },
    description: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedDate: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Compound indexes for better performance
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ course: 1, assignment: 1 });
gradeSchema.index({ student: 1, assignment: 1 }, { unique: true });
gradeSchema.index({ instructor: 1, gradedDate: -1 });

// Virtual for grade point value
gradeSchema.virtual('gradePoints').get(function() {
  const gradeScale = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeScale[this.letterGrade] || 0;
});

// Virtual for pass/fail status
gradeSchema.virtual('isPassing').get(function() {
  return this.percentage >= 60; // Assuming 60% is passing
});

// Pre-save middleware to calculate percentage and letter grade
gradeSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.points !== undefined && this.totalPoints > 0) {
    this.percentage = Math.round((this.points / this.totalPoints) * 100 * 100) / 100;
  }
  
  // Apply late penalty if applicable
  if (this.isLate && this.latePenalty > 0) {
    this.percentage = Math.max(0, this.percentage - this.latePenalty);
    this.points = Math.round((this.percentage / 100) * this.totalPoints * 100) / 100;
  }
  
  // Calculate letter grade based on percentage
  this.letterGrade = this.calculateLetterGrade(this.percentage);
  
  // Update last modified timestamp
  this.lastModified = new Date();
  
  next();
});

// Method to calculate letter grade
gradeSchema.methods.calculateLetterGrade = function(percentage) {
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

// Method to add comment
gradeSchema.methods.addComment = function(authorId, content, isPrivate = false) {
  this.comments.push({
    author: authorId,
    content: content,
    isPrivate: isPrivate,
    timestamp: new Date()
  });
  return this.save();
};

// Method to flag grade
gradeSchema.methods.addFlag = function(type, description, flaggedBy) {
  this.flags.push({
    type: type,
    description: description,
    flaggedBy: flaggedBy,
    flaggedDate: new Date(),
    resolved: false
  });
  return this.save();
};

// Method to resolve flag
gradeSchema.methods.resolveFlag = function(flagId) {
  const flag = this.flags.id(flagId);
  if (flag) {
    flag.resolved = true;
    return this.save();
  }
  throw new Error('Flag not found');
};

// Static method to calculate course average
gradeSchema.statics.calculateCourseAverage = async function(courseId) {
  const result = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    { $group: {
      _id: null,
      averagePercentage: { $avg: '$percentage' },
      totalGrades: { $sum: 1 },
      passingGrades: {
        $sum: { $cond: [{ $gte: ['$percentage', 60] }, 1, 0] }
      }
    }}
  ]);
  
  if (result.length === 0) return null;
  
  const stats = result[0];
  return {
    average: Math.round(stats.averagePercentage * 100) / 100,
    totalGrades: stats.totalGrades,
    passingRate: Math.round((stats.passingGrades / stats.totalGrades) * 100 * 100) / 100
  };
};

// Static method to get student's course grades
gradeSchema.statics.getStudentCourseGrades = async function(studentId, courseId) {
  return await this.find({ student: studentId, course: courseId })
    .populate('assignment', 'title type dueDate totalPoints')
    .sort({ gradedDate: -1 });
};

module.exports = mongoose.model('Grade', gradeSchema);