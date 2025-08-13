const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path'); // Import the 'path' module

// Explicitly load .env file from the project root
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const Announcement = require('../models/Announcement');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    console.log('MONGODB_URI from seedData.js:', process.env.MONGODB_URI);

    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Grade.deleteMany({});
    await Announcement.deleteMany({});
    
    console.log('Creating users...');
    
    // Create Admin
    const admin = await User.create({
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'admin@university.edu',
      password: 'admin123',
      role: 'admin',
      department: 'Computer Science',
      phone: '+1-555-0101',
      address: {
        street: '123 Admin St',
        city: 'University City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      dateOfBirth: new Date('1980-05-15'),
      emailVerified: true,
      employeeId: 'EMP001'
    });
    
    // Create Instructors
    const instructors = await User.create([
      {
        firstName: 'Dr. Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@university.edu',
        password: 'instructor123',
        role: 'instructor',
        department: 'Computer Science',
        phone: '+1-555-0102',
        address: {
          street: '456 Faculty Ave',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('1975-08-22'),
        emailVerified: true,
        employeeId: 'EMP002'
      },
      {
        firstName: 'Prof. Emily',
        lastName: 'Davis',
        email: 'emily.davis@university.edu',
        password: 'instructor123',
        role: 'instructor',
        department: 'Mathematics',
        phone: '+1-555-0103',
        address: {
          street: '789 Professor Blvd',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('1978-12-10'),
        emailVerified: true,
        employeeId: 'EMP003'
      },
      {
        firstName: 'Dr. Robert',
        lastName: 'Chen',
        email: 'robert.chen@university.edu',
        password: 'instructor123',
        role: 'instructor',
        department: 'Physics',
        phone: '+1-555-0104',
        address: {
          street: '321 Science Way',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('1972-03-18'),
        emailVerified: true,
        employeeId: 'EMP004'
      }
    ]);
    
    // Create Students
    const students = await User.create([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@student.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        year: 'Junior',
        gpa: 3.7,
        phone: '+1-555-0201',
        address: {
          street: '100 Student Dr',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('2002-06-15'),
        emailVerified: true,
        studentId: 'STU001'
      },
      {
        firstName: 'Emma',
        lastName: 'Williams',
        email: 'emma.williams@student.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        year: 'Senior',
        gpa: 3.9,
        phone: '+1-555-0202',
        address: {
          street: '200 Dorm Lane',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('2001-09-22'),
        emailVerified: true,
        studentId: 'STU002'
      },
      {
        firstName: 'Alex',
        lastName: 'Brown',
        email: 'alex.brown@student.edu',
        password: 'student123',
        role: 'student',
        department: 'Mathematics',
        year: 'Sophomore',
        gpa: 3.5,
        phone: '+1-555-0203',
        address: {
          street: '300 Campus Rd',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('2003-01-08'),
        emailVerified: true,
        studentId: 'STU003'
      },
      {
        firstName: 'Sophia',
        lastName: 'Garcia',
        email: 'sophia.garcia@student.edu',
        password: 'student123',
        role: 'student',
        department: 'Physics',
        year: 'Freshman',
        gpa: 3.8,
        phone: '+1-555-0204',
        address: {
          street: '400 Freshman Hall',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('2004-11-30'),
        emailVerified: true,
        studentId: 'STU004'
      },
      {
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@student.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        year: 'Senior',
        gpa: 3.6,
        phone: '+1-555-0205',
        address: {
          street: '500 Senior St',
          city: 'University City',
          state: 'CA',
          zipCode: '90210'
        },
        dateOfBirth: new Date('2001-04-12'),
        emailVerified: true,
        studentId: 'STU005'
      }
    ]);
    
    console.log('Creating courses...');
    
    // Create Courses
    const courses = await Course.create([
      {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science including programming basics, algorithms, and problem-solving techniques.',
        department: 'Computer Science',
        credits: 4,
        instructor: instructors[0]._id,
        semester: 'Fall',
        year: 2024,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '09:00',
          endTime: '10:30',
          room: '101',
          building: 'Computer Science Building'
        },
        capacity: 30,
        prerequisites: [],
        materials: [
          {
            title: 'Introduction to Programming with Python',
            type: 'textbook',
            required: true,
            description: 'Main textbook for the course'
          },
          {
            title: 'Python 3.9+',
            type: 'software',
            required: true,
            description: 'Programming environment'
          }
        ],
        learningObjectives: [
          'Understand basic programming concepts',
          'Write simple Python programs',
          'Apply problem-solving techniques',
          'Understand algorithm design'
        ],
        difficulty: 'Beginner'
      },
      {
        courseCode: 'CS201',
        title: 'Data Structures and Algorithms',
        description: 'Study of fundamental data structures and algorithms, including arrays, linked lists, trees, graphs, sorting, and searching.',
        department: 'Computer Science',
        credits: 4,
        instructor: instructors[0]._id,
        semester: 'Spring',
        year: 2024,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '14:00',
          endTime: '15:30',
          room: '205',
          building: 'Computer Science Building'
        },
        capacity: 25,
        prerequisites: ['CS101'],
        materials: [
          {
            title: 'Introduction to Algorithms',
            type: 'textbook',
            required: true,
            description: 'Comprehensive algorithms textbook'
          }
        ],
        learningObjectives: [
          'Implement fundamental data structures',
          'Analyze algorithm complexity',
          'Design efficient algorithms',
          'Solve complex programming problems'
        ],
        difficulty: 'Intermediate'
      },
      {
        courseCode: 'MATH201',
        title: 'Calculus II',
        description: 'Continuation of Calculus I covering integration techniques, applications of integrals, and infinite series.',
        department: 'Mathematics',
        credits: 4,
        instructor: instructors[1]._id,
        semester: 'Fall',
        year: 2024,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '11:00',
          endTime: '12:00',
          room: '301',
          building: 'Mathematics Building'
        },
        capacity: 35,
        prerequisites: ['MATH101'],
        materials: [
          {
            title: 'Calculus: Early Transcendentals',
            type: 'textbook',
            required: true,
            description: 'Standard calculus textbook'
          },
          {
            title: 'Graphing Calculator',
            type: 'equipment',
            required: true,
            description: 'TI-84 or equivalent'
          }
        ],
        learningObjectives: [
          'Master integration techniques',
          'Apply integrals to real-world problems',
          'Understand infinite series',
          'Solve differential equations'
        ],
        difficulty: 'Intermediate'
      },
      {
        courseCode: 'PHYS101',
        title: 'General Physics I',
        description: 'Introduction to mechanics, including kinematics, dynamics, energy, momentum, and rotational motion.',
        department: 'Physics',
        credits: 4,
        instructor: instructors[2]._id,
        semester: 'Fall',
        year: 2024,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '10:00',
          endTime: '11:30',
          room: '150',
          building: 'Physics Building'
        },
        capacity: 40,
        prerequisites: ['MATH101'],
        materials: [
          {
            title: 'University Physics with Modern Physics',
            type: 'textbook',
            required: true,
            description: 'Comprehensive physics textbook'
          },
          {
            title: 'Lab Manual',
            type: 'textbook',
            required: true,
            description: 'Physics laboratory experiments'
          }
        ],
        learningObjectives: [
          'Understand fundamental physics principles',
          'Apply mathematical concepts to physics',
          'Conduct laboratory experiments',
          'Analyze experimental data'
        ],
        difficulty: 'Intermediate'
      },
      {
        courseCode: 'CS301',
        title: 'Database Systems',
        description: 'Design and implementation of database systems, including relational model, SQL, normalization, and transaction processing.',
        department: 'Computer Science',
        credits: 3,
        instructor: instructors[0]._id,
        semester: 'Spring',
        year: 2024,
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '16:00',
          endTime: '17:30',
          room: '210',
          building: 'Computer Science Building'
        },
        capacity: 20,
        prerequisites: ['CS201'],
        materials: [
          {
            title: 'Database System Concepts',
            type: 'textbook',
            required: true,
            description: 'Comprehensive database textbook'
          },
          {
            title: 'MySQL Workbench',
            type: 'software',
            required: true,
            description: 'Database management tool'
          }
        ],
        learningObjectives: [
          'Design relational databases',
          'Write complex SQL queries',
          'Understand database normalization',
          'Implement database applications'
        ],
        difficulty: 'Advanced'
      },
      {
        courseCode: 'CS401',
        title: 'Software Engineering',
        description: 'Principles and practices of software engineering, including project management, design patterns, testing, and team collaboration.',
        department: 'Computer Science',
        credits: 4,
        instructor: instructors[0]._id,
        semester: 'Fall',
        year: 2024,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '13:00',
          endTime: '14:30',
          room: '220',
          building: 'Computer Science Building'
        },
        capacity: 15,
        prerequisites: ['CS201', 'CS301'],
        materials: [
          {
            title: 'Software Engineering: A Practitioner\'s Approach',
            type: 'textbook',
            required: true,
            description: 'Industry-standard software engineering textbook'
          },
          {
            title: 'Git',
            type: 'software',
            required: true,
            description: 'Version control system'
          }
        ],
        learningObjectives: [
          'Apply software engineering principles',
          'Manage software projects',
          'Work effectively in teams',
          'Design scalable software systems'
        ],
        difficulty: 'Advanced'
      }
    ]);
    
    // Enroll students in courses
    console.log('Enrolling students in courses...');
    
    // John Smith enrollments
    await courses[0].enrollStudent(students[0]._id); // CS101
    await courses[1].enrollStudent(students[0]._id); // CS201
    await courses[4].enrollStudent(students[0]._id); // CS301
    students[0].enrolledCourses.push(courses[0]._id, courses[1]._id, courses[4]._id);
    await students[0].save();
    
    // Emma Williams enrollments
    await courses[1].enrollStudent(students[1]._id); // CS201
    await courses[4].enrollStudent(students[1]._id); // CS301
    await courses[5].enrollStudent(students[1]._id); // CS401
    students[1].enrolledCourses.push(courses[1]._id, courses[4]._id, courses[5]._id);
    await students[1].save();
    
    // Alex Brown enrollments
    await courses[0].enrollStudent(students[2]._id); // CS101
    await courses[2].enrollStudent(students[2]._id); // MATH201
    students[2].enrolledCourses.push(courses[0]._id, courses[2]._id);
    await students[2].save();
    
    // Sophia Garcia enrollments
    await courses[0].enrollStudent(students[3]._id); // CS101
    await courses[3].enrollStudent(students[3]._id); // PHYS101
    students[3].enrolledCourses.push(courses[0]._id, courses[3]._id);
    await students[3].save();
    
    // David Miller enrollments
    await courses[1].enrollStudent(students[4]._id); // CS201
    await courses[4].enrollStudent(students[4]._id); // CS301
    await courses[5].enrollStudent(students[4]._id); // CS401
    students[4].enrolledCourses.push(courses[1]._id, courses[4]._id, courses[5]._id);
    await students[4].save();
    
    console.log('Creating assignments...');
    
    // Create Assignments
    const assignments = [];
    
    // CS101 Assignments
    const cs101Assignments = await Assignment.create([
      {
        title: 'Python Basics - Variables and Data Types',
        description: 'Write a Python program that demonstrates the use of different data types including integers, floats, strings, and booleans. Include examples of type conversion and basic operations.',
        course: courses[0]._id,
        instructor: instructors[0]._id,
        type: 'homework',
        totalPoints: 100,
        dueDate: new Date('2025-09-15T23:59:00'), // Updated to future
        instructions: 'Create a Python file that includes:\n1. Variable declarations for each data type\n2. Examples of arithmetic operations\n3. String manipulation examples\n4. Type conversion examples\n5. Comments explaining each section',
        rubric: [
          { criteria: 'Code Quality', points: 30, description: 'Clean, readable code with proper naming' },
          { criteria: 'Functionality', points: 40, description: 'All requirements implemented correctly' },
          { criteria: 'Documentation', points: 20, description: 'Adequate comments and explanations' },
          { criteria: 'Testing', points: 10, description: 'Evidence of testing different scenarios' }
        ],
        allowLateSubmission: true,
        latePenalty: 10,
        estimatedTime: 3,
        difficulty: 'Easy',
        tags: ['python', 'basics', 'variables']
      },
      {
        title: 'Control Structures Quiz',
        description: 'Online quiz covering if statements, loops, and conditional logic in Python.',
        course: courses[0]._id,
        instructor: instructors[0]._id,
        type: 'quiz',
        totalPoints: 50,
        dueDate: new Date('2025-09-22T14:30:00'), // Updated to future
        instructions: 'Complete the online quiz within the time limit. You have 30 minutes to answer 25 multiple choice questions.',
        timeLimit: 30,
        maxAttempts: 1,
        allowLateSubmission: false,
        estimatedTime: 0.5,
        difficulty: 'Easy',
        tags: ['python', 'control-structures', 'quiz']
      },
      {
        title: 'Function Design Project',
        description: 'Design and implement a collection of Python functions that solve real-world problems.',
        course: courses[0]._id,
        instructor: instructors[0]._id,
        type: 'project',
        totalPoints: 150,
        dueDate: new Date('2025-10-01T23:59:00'), // Updated to future
        instructions: 'Create a Python module with at least 5 functions that:\n1. Solve different types of problems\n2. Include proper documentation\n3. Have comprehensive test cases\n4. Demonstrate good programming practices',
        rubric: [
          { criteria: 'Function Design', points: 50, description: 'Well-designed, reusable functions' },
          { criteria: 'Problem Solving', points: 40, description: 'Creative solutions to real problems' },
          { criteria: 'Documentation', points: 30, description: 'Clear docstrings and comments' },
          { criteria: 'Testing', points: 30, description: 'Comprehensive test cases' }
        ],
        allowLateSubmission: true,
        latePenalty: 15,
        estimatedTime: 8,
        difficulty: 'Medium',
        tags: ['python', 'functions', 'project']
      }
    ]);
    assignments.push(...cs101Assignments);
    
    // CS201 Assignments
    const cs201Assignments = await Assignment.create([
      {
        title: 'Linked List Implementation',
        description: 'Implement a doubly linked list data structure with all basic operations.',
        course: courses[1]._id,
        instructor: instructors[0]._id,
        type: 'homework',
        totalPoints: 120,
        dueDate: new Date('2025-09-20T23:59:00'), // Updated to future
        instructions: 'Implement a DoublyLinkedList class with methods for:\n1. Insert (at beginning, end, and specific position)\n2. Delete (by value and by position)\n3. Search\n4. Display (forward and backward)\n5. Size calculation',
        rubric: [
          { criteria: 'Implementation', points: 60, description: 'Correct implementation of all methods' },
          { criteria: 'Efficiency', points: 30, description: 'Optimal time complexity' },
          { criteria: 'Code Quality', points: 20, description: 'Clean, well-structured code' },
          { criteria: 'Testing', points: 10, description: 'Comprehensive test cases' }
        ],
        allowLateSubmission: true,
        latePenalty: 10,
        estimatedTime: 6,
        difficulty: 'Medium',
        tags: ['data-structures', 'linked-list', 'implementation']
      },
      {
        title: 'Algorithm Analysis Exam',
        description: 'Comprehensive exam on time and space complexity analysis of algorithms.',
        course: courses[1]._id,
        instructor: instructors[0]._id,
        type: 'exam',
        totalPoints: 200,
        dueDate: new Date('2025-10-15T16:00:00'), // Updated to future
        instructions: 'In-person exam covering:\n1. Big O notation\n2. Algorithm analysis\n3. Sorting algorithms\n4. Search algorithms\n5. Graph algorithms',
        timeLimit: 120,
        maxAttempts: 1,
        allowLateSubmission: false,
        estimatedTime: 2,
        difficulty: 'Hard',
        tags: ['algorithms', 'complexity', 'exam']
      }
    ]);
    assignments.push(...cs201Assignments);
    
    // MATH201 Assignments
    const math201Assignments = await Assignment.create([
      {
        title: 'Integration Techniques Homework',
        description: 'Solve integration problems using various techniques including substitution, integration by parts, and partial fractions.',
        course: courses[2]._id,
        instructor: instructors[1]._id,
        type: 'homework',
        totalPoints: 80,
        dueDate: new Date('2025-09-18T23:59:00'), // Updated to future
        instructions: 'Complete problems 1-20 from Chapter 7. Show all work and clearly indicate the integration technique used for each problem.',
        allowLateSubmission: true,
        latePenalty: 5,
        estimatedTime: 4,
        difficulty: 'Medium',
        tags: ['calculus', 'integration', 'homework']
      }
    ]);
    assignments.push(...math201Assignments);
    
    console.log('Creating grades...');
    
    // Create sample grades
    const grades = await Grade.create([
      // John Smith grades
      {
        student: students[0]._id,
        course: courses[0]._id,
        assignment: assignments[0]._id,
        instructor: instructors[0]._id,
        points: 85,
        totalPoints: 100,
        feedback: 'Good work on the basics. Your code is clean and well-commented. Consider adding more test cases next time.',
        submissionDate: new Date('2025-09-14T20:30:00'), // Updated to future
        gradedDate: new Date('2025-09-16T10:00:00') // Updated to future
      },
      {
        student: students[0]._id,
        course: courses[0]._id,
        assignment: assignments[1]._id,
        instructor: instructors[0]._id,
        points: 42,
        totalPoints: 50,
        feedback: 'Solid understanding of control structures. Minor mistakes on loop conditions.',
        submissionDate: new Date('2025-09-22T14:15:00'), // Updated to future
        gradedDate: new Date('2025-09-22T16:00:00') // Updated to future
      },
      // Emma Williams grades
      {
        student: students[1]._id,
        course: courses[1]._id,
        assignment: assignments[3]._id,
        instructor: instructors[0]._id,
        points: 110,
        totalPoints: 120,
        feedback: 'Excellent implementation! Your linked list is efficient and well-tested. Great job on the edge cases.',
        submissionDate: new Date('2025-09-19T18:45:00'), // Updated to future
        gradedDate: new Date('2025-09-21T14:30:00') // Updated to future
      },
      // Alex Brown grades
      {
        student: students[2]._id,
        course: courses[0]._id,
        assignment: assignments[0]._id,
        instructor: instructors[0]._id,
        points: 78,
        totalPoints: 100,
        feedback: 'Good effort. Your code works correctly but could benefit from better variable naming and more comments.',
        submissionDate: new Date('2025-09-15T22:15:00'), // Updated to future
        gradedDate: new Date('2025-09-17T09:30:00') // Updated to future
      },
      {
        student: students[2]._id,
        course: courses[2]._id,
        assignment: assignments[5]._id,
        instructor: instructors[1]._id,
        points: 72,
        totalPoints: 80,
        feedback: 'Strong work on integration techniques. Minor algebraic errors in problems 15 and 18.',
        submissionDate: new Date('2025-09-18T21:00:00'), // Updated to future
        gradedDate: new Date('2025-09-20T11:15:00') // Updated to future
      }
    ]);
    
    console.log('Creating announcements...');
    
    // Create Announcements
    await Announcement.create([
      {
        title: 'Welcome to Fall 2025 Semester!', // Changed year
        content: 'Welcome back students! We\'re excited to start another great semester. Please make sure to check your course schedules and required materials. The bookstore is offering a 10% discount on textbooks through the end of this week.',
        author: admin._id,
        type: 'general',
        priority: 'high',
        targetAudience: 'all',
        isPinned: true,
        tags: ['welcome', 'semester', 'bookstore']
      },
      {
        title: 'CS101 - First Assignment Posted',
        content: 'The first assignment for CS101 has been posted. It covers Python basics including variables and data types. Please review the requirements carefully and don\'t hesitate to ask questions during office hours.',
        author: instructors[0]._id,
        course: courses[0]._id,
        type: 'assignment',
        priority: 'medium',
        targetAudience: 'specific_course',
        tags: ['assignment', 'python', 'cs101']
      },
      {
        title: 'Library Extended Hours During Finals',
        content: 'The university library will be extending its hours during finals week. We will be open 24/7 from December 10-17. Additional study spaces and computer labs will also be available.',
        author: admin._id,
        type: 'general',
        priority: 'medium',
        targetAudience: 'students',
        expiryDate: new Date('2025-12-20T00:00:00'), // Updated to future
        tags: ['library', 'finals', 'study-spaces']
      },
      {
        title: 'CS201 - Midterm Exam Schedule',
        content: 'The midterm exam for CS201 will be held on October 15th from 2:00 PM to 4:00 PM in room 205. The exam will cover chapters 1-8 including data structures and algorithm analysis. Review sessions will be held on October 12th and 13th.', // Updated month
        author: instructors[0]._id,
        course: courses[1]._id,
        type: 'exam',
        priority: 'high',
        targetAudience: 'specific_course',
        tags: ['midterm', 'exam', 'cs201', 'review-session']
      },
      {
        title: 'Campus Network Maintenance',
        content: 'The campus network will undergo scheduled maintenance this Saturday from 2:00 AM to 6:00 AM. During this time, internet access may be intermittent. Please plan accordingly for any online assignments or activities.',
        author: admin._id,
        type: 'schedule',
        priority: 'medium',
        targetAudience: 'all',
        expiryDate: new Date('2025-08-25T00:00:00'), // Updated to future
        tags: ['network', 'maintenance', 'internet']
      }
    ]);
    
    console.log('Seed data created successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@university.edu / admin123');
    console.log('Instructor: michael.johnson@university.edu / instructor123');
    console.log('Student: john.smith@student.edu / student123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
