const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  isLate: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    default: ''
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  gradedAt: Date,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['homework', 'quiz', 'exam', 'project', 'lab', 'essay', 'presentation', 'discussion']
  },
  totalPoints: {
    type: Number,
    required: true,
    min: [1, 'Total points must be at least 1'],
    max: [1000, 'Total points cannot exceed 1000']
  },
  dueDate: {
    type: Date,
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  instructions: {
    type: String,
    maxlength: [5000, 'Instructions cannot exceed 5000 characters']
  },
  rubric: [{
    criteria: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    },
    description: String
  }],
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  latePenalty: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  timeLimit: {
    type: Number, // in minutes
    min: 1
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  submissions: [submissionSchema],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    description: String
  }],
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  estimatedTime: {
    type: Number, // in hours
    min: 0.5,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for better performance
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ type: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Virtual for average grade
assignmentSchema.virtual('averageGrade').get(function() {
  const gradedSubmissions = this.submissions.filter(sub => sub.grade !== undefined);
  if (gradedSubmissions.length === 0) return 0;
  
  const total = gradedSubmissions.reduce((sum, sub) => sum + sub.grade, 0);
  return (total / gradedSubmissions.length).toFixed(2);
});

// Virtual for overdue status
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Method to check if student has submitted
assignmentSchema.methods.hasStudentSubmitted = function(studentId) {
  return this.submissions.some(sub => sub.student.toString() === studentId.toString());
};

// Method to get student's submission
assignmentSchema.methods.getStudentSubmission = function(studentId) {
  return this.submissions.find(sub => sub.student.toString() === studentId.toString());
};

// Method to submit assignment
assignmentSchema.methods.submitAssignment = function(studentId, submissionData) {
  const existingSubmission = this.getStudentSubmission(studentId);
  
  if (existingSubmission && this.maxAttempts === 1) {
    throw new Error('Assignment has already been submitted');
  }
  
  const submissionCount = this.submissions.filter(
    sub => sub.student.toString() === studentId.toString()
  ).length;
  
  if (submissionCount >= this.maxAttempts) {
    throw new Error(`Maximum attempts (${this.maxAttempts}) exceeded`);
  }
  
  const isLate = new Date() > this.dueDate;
  
  if (isLate && !this.allowLateSubmission) {
    throw new Error('Late submissions are not allowed for this assignment');
  }
  
  const submission = {
    student: studentId,
    content: submissionData.content,
    attachments: submissionData.attachments || [],
    isLate: isLate,
    submittedAt: new Date()
  };
  
  this.submissions.push(submission);
  return this.save();
};

// Method to grade submission
assignmentSchema.methods.gradeSubmission = function(studentId, grade, feedback, gradedBy) {
  const submission = this.getStudentSubmission(studentId);
  
  if (!submission) {
    throw new Error('No submission found for this student');
  }
  
  if (grade < 0 || grade > this.totalPoints) {
    throw new Error(`Grade must be between 0 and ${this.totalPoints}`);
  }
  
  submission.grade = grade;
  submission.feedback = feedback || '';
  submission.gradedAt = new Date();
  submission.gradedBy = gradedBy;
  
  return this.save();
};

// Pre-save validation
assignmentSchema.pre('save', function(next) {
  // Validate due date is in the future for new assignments
  if (this.isNew && this.dueDate <= new Date()) {
    return next(new Error('Due date must be in the future'));
  }
  
  // Validate rubric points total matches total points
  if (this.rubric && this.rubric.length > 0) {
    const rubricTotal = this.rubric.reduce((sum, item) => sum + item.points, 0);
    if (rubricTotal !== this.totalPoints) {
      return next(new Error('Rubric points must total the assignment total points'));
    }
  }
  
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);