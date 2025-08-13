const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    required: function() { return this.role === 'student'; }
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    required: function() { return this.role === 'instructor' || this.role === 'admin'; }
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Business', 'Engineering', 'Psychology']
  },
  year: {
    type: String,
    enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'],
    required: function() { return this.role === 'student'; }
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4,
    default: 0
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  dateOfBirth: Date,
  profilePicture: {
    type: String,
    default: ''
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ role: 1, department: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate student/employee ID
userSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.role === 'student' && !this.studentId) {
      this.studentId = `STU${Date.now().toString().slice(-6)}`;
    } else if ((this.role === 'instructor' || this.role === 'admin') && !this.employeeId) {
      this.employeeId = `EMP${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Update GPA calculation method
userSchema.methods.calculateGPA = async function() {
  const Grade = mongoose.model('Grade');
  const grades = await Grade.find({ student: this._id }).populate('assignment');
  
  if (grades.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach(grade => {
    const gradePoints = this.getGradePoints(grade.letterGrade);
    const credits = grade.assignment.credits || 3; // Default 3 credits
    totalPoints += gradePoints * credits;
    totalCredits += credits;
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
};

userSchema.methods.getGradePoints = function(letterGrade) {
  const gradeScale = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  return gradeScale[letterGrade] || 0;
};

module.exports = mongoose.model('User', userSchema);