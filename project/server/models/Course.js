const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001']
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Business', 'Engineering', 'Psychology']
  },
  credits: {
    type: Number,
    required: true,
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    room: {
      type: String,
      required: true
    },
    building: {
      type: String,
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500']
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'dropped', 'completed'],
      default: 'enrolled'
    }
  }],
  prerequisites: [{
    type: String,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Prerequisite must be a valid course code']
  }],
  syllabus: {
    type: String,
    default: ''
  },
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['textbook', 'software', 'equipment', 'other']
    },
    required: {
      type: Boolean,
      default: true
    },
    description: String
  }],
  learningObjectives: [String],
  gradingPolicy: {
    assignments: { type: Number, default: 30 },
    quizzes: { type: Number, default: 20 },
    midterm: { type: Number, default: 20 },
    final: { type: Number, default: 30 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  }
}, {
  timestamps: true
});

// Indexes for better performance
courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1, semester: 1, year: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.filter(enrollment => enrollment.status === 'enrolled').length;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.enrollmentCount;
});

// Virtual for full course name
courseSchema.virtual('fullName').get(function() {
  return `${this.courseCode} - ${this.title}`;
});

// Method to check if student is enrolled
courseSchema.methods.isStudentEnrolled = function(studentId) {
  return this.enrolledStudents.some(
    enrollment => enrollment.student.toString() === studentId.toString() && 
    enrollment.status === 'enrolled'
  );
};

// Method to enroll student
courseSchema.methods.enrollStudent = function(studentId) {
  if (this.isStudentEnrolled(studentId)) {
    throw new Error('Student is already enrolled in this course');
  }
  
  if (this.enrollmentCount >= this.capacity) {
    throw new Error('Course is at full capacity');
  }
  
  this.enrolledStudents.push({
    student: studentId,
    enrollmentDate: new Date(),
    status: 'enrolled'
  });
  
  return this.save();
};

// Method to drop student
courseSchema.methods.dropStudent = function(studentId) {
  const enrollment = this.enrolledStudents.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this course');
  }
  
  enrollment.status = 'dropped';
  return this.save();
};

// Pre-save validation
courseSchema.pre('save', function(next) {
  // Validate schedule times
  if (this.schedule.startTime >= this.schedule.endTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate grading policy totals 100%
  const total = Object.values(this.gradingPolicy).reduce((sum, val) => sum + val, 0);
  if (total !== 100) {
    return next(new Error('Grading policy percentages must total 100%'));
  }
  
  next();
});

module.exports = mongoose.model('Course', courseSchema);