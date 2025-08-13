export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  department: string;
  year?: string;
  studentId?: string;
  employeeId?: string;
  gpa?: number;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string;
  profilePicture?: string;
  enrolledCourses?: Course[];
  lastLogin?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Course {
  _id: string;
  courseCode: string;
  title: string;
  description: string;
  department: string;
  credits: number;
  instructor: User;
  semester: 'Fall' | 'Spring' | 'Summer';
  year: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    room: string;
    building: string;
  };
  capacity: number;
  enrolledStudents: Array<{
    student: string;
    enrollmentDate: string;
    status: 'enrolled' | 'dropped' | 'completed';
  }>;
  prerequisites: string[];
  syllabus?: string;
  materials: Array<{
    title: string;
    type: 'textbook' | 'software' | 'equipment' | 'other';
    required: boolean;
    description: string;
  }>;
  learningObjectives: string[];
  gradingPolicy: {
    assignments: number;
    quizzes: number;
    midterm: number;
    final: number;
  };
  isActive: boolean;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  enrollmentCount: number;
  availableSpots: number;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: Course;
  instructor: User;
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'lab' | 'essay' | 'presentation' | 'discussion';
  totalPoints: number;
  dueDate: string;
  assignedDate: string;
  instructions?: string;
  questions?: Array<{
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'code';
    question: string;
    options?: string[];
    correctAnswer?: string | number;
    points: number;
    explanation?: string;
  }>;
  rubric?: Array<{
    criteria: string;
    points: number;
    description: string;
  }>;
  allowLateSubmission: boolean;
  latePenalty: number;
  maxAttempts: number;
  timeLimit?: number;
  isPublished: boolean;
  submissions: Submission[];
  attachments: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    description: string;
  }>;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime?: number;
  submissionCount: number;
  averageGrade: number;
  isOverdue: boolean;
  autoGrade: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  student: User;
  submittedAt: string;
  content?: string;
  answers?: Array<{
    questionId: string;
    answer: string | number;
    timeSpent?: number;
  }>;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  }>;
  isLate: boolean;
  feedback?: string;
  grade?: number;
  gradedAt?: string;
  gradedBy?: User;
  autoGraded?: boolean;
  timeSpent?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface Grade {
  _id: string;
  student: User;
  course: Course;
  assignment: Assignment;
  instructor: User;
  points: number;
  totalPoints: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  rubricScores: Array<{
    criteria: string;
    points: number;
    maxPoints: number;
    feedback: string;
  }>;
  isExcused: boolean;
  isLate: boolean;
  latePenalty: number;
  submissionDate?: string;
  gradedDate: string;
  lastModified: string;
  version: number;
  comments: Array<{
    author: User;
    content: string;
    timestamp: string;
    isPrivate: boolean;
  }>;
  flags: Array<{
    type: 'regrade_request' | 'academic_integrity' | 'incomplete' | 'extra_credit';
    description: string;
    flaggedBy: User;
    flaggedDate: string;
    resolved: boolean;
  }>;
  gradePoints: number;
  isPassing: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: User;
  course?: Course;
  type: 'general' | 'assignment' | 'exam' | 'schedule' | 'emergency' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'instructors' | 'specific_course';
  isPublished: boolean;
  publishDate: string;
  expiryDate?: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    description: string;
  }>;
  tags: string[];
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  isPinned: boolean;
  allowComments: boolean;
  comments: Array<{
    author: User;
    content: string;
    timestamp: string;
    isEdited: boolean;
    editedAt?: string;
  }>;
  notificationSent: boolean;
  emailSent: boolean;
  readCount: number;
  commentCount: number;
  isExpired: boolean;
  urgencyScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
  department: string;
  year?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalAssignments: number;
  averageGPA: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
    user?: User;
    course?: Course;
  }>;
  upcomingDeadlines: Assignment[];
  recentGrades: Grade[];
  announcements: Announcement[];
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  announcements: boolean;
  assignments: boolean;
  grades: boolean;
  reminders: boolean;
}