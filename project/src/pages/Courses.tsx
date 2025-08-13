import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  MapPin,
  Calendar,
  Star,
  Filter,
  Search,
  Plus,
  ChevronRight,
  GraduationCap,
  User,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDate, getDifficultyColor } from '../lib/utils';

// Mock courses data
const mockCourses = [
  {
    _id: '1',
    courseCode: 'CS101',
    title: 'Introduction to Computer Science',
    description: 'Comprehensive introduction to computer science fundamentals including Python programming, algorithm design, data structures basics, and computational thinking. Students will learn to write clean, efficient code and solve complex problems using programming techniques.',
    department: 'Computer Science',
    credits: 4,
    instructor: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@university.edu'
    },
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
    enrollmentCount: 28,
    availableSpots: 2,
    prerequisites: [],
    difficulty: 'Beginner',
    tags: ['programming', 'python', 'algorithms', 'problem-solving', 'fundamentals'],
    isActive: true,
    learningObjectives: [
      'Understand basic programming concepts',
      'Write efficient Python programs',
      'Apply algorithmic thinking to solve problems',
      'Understand data types and control structures',
      'Debug and test code effectively'
    ],
    materials: [
      {
        title: 'Python Crash Course, 2nd Edition',
        type: 'textbook',
        required: true,
        description: 'Comprehensive Python programming guide'
      },
      {
        title: 'PyCharm IDE or VS Code',
        type: 'software',
        required: true,
        description: 'Integrated development environment'
      }
    ]
  },
  {
    _id: '2',
    courseCode: 'CS201',
    title: 'Data Structures and Algorithms',
    description: 'Advanced study of fundamental data structures (arrays, linked lists, stacks, queues, trees, graphs, hash tables) and algorithms (sorting, searching, graph traversal, dynamic programming). Emphasis on algorithm analysis, time/space complexity, and practical implementation.',
    department: 'Computer Science',
    credits: 4,
    instructor: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@university.edu'
    },
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
    enrollmentCount: 24,
    availableSpots: 1,
    prerequisites: ['CS101'],
    difficulty: 'Intermediate',
    tags: ['data-structures', 'algorithms', 'complexity-analysis', 'trees', 'graphs', 'sorting'],
    isActive: true,
    learningObjectives: [
      'Implement fundamental data structures',
      'Analyze time and space complexity using Big O notation',
      'Design efficient algorithms for various problems',
      'Choose appropriate data structures for specific applications',
      'Implement graph algorithms and tree traversals'
    ],
    materials: [
      {
        title: 'Introduction to Algorithms (CLRS), 4th Edition',
        type: 'textbook',
        required: true,
        description: 'Comprehensive algorithms textbook'
      },
      {
        title: 'LeetCode Premium Subscription',
        type: 'software',
        required: false,
        description: 'Practice platform for coding problems'
      }
    ]
  },
  {
    _id: '3',
    courseCode: 'MATH201',
    title: 'Calculus II',
    description: 'Continuation of Calculus I covering integration techniques, applications of integrals, and infinite series.',
    department: 'Mathematics',
    credits: 4,
    instructor: {
      _id: 'inst2',
      firstName: 'Prof. Emily',
      lastName: 'Davis',
      email: 'emily.davis@university.edu'
    },
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
    enrollmentCount: 30,
    availableSpots: 5,
    prerequisites: ['MATH101'],
    difficulty: 'Intermediate',
    tags: ['calculus', 'integration', 'series'],
    isActive: true,
    learningObjectives: [
      'Master integration techniques',
      'Apply integrals to real-world problems',
      'Understand infinite series'
    ],
    materials: [
      {
        title: 'Calculus: Early Transcendentals',
        type: 'textbook',
        required: true
      }
    ]
  },
  {
    _id: '4',
    courseCode: 'PHYS101',
    title: 'General Physics I',
    description: 'Introduction to mechanics, including kinematics, dynamics, energy, momentum, and rotational motion.',
    department: 'Physics',
    credits: 4,
    instructor: {
      _id: 'inst3',
      firstName: 'Dr. Robert',
      lastName: 'Chen',
      email: 'robert.chen@university.edu'
    },
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
    enrollmentCount: 35,
    availableSpots: 5,
    prerequisites: ['MATH101'],
    difficulty: 'Intermediate',
    tags: ['physics', 'mechanics', 'laboratory'],
    isActive: true,
    learningObjectives: [
      'Understand fundamental physics principles',
      'Apply mathematical concepts to physics',
      'Conduct laboratory experiments'
    ],
    materials: [
      {
        title: 'University Physics with Modern Physics',
        type: 'textbook',
        required: true
      }
    ]
  },
  {
    _id: '5',
    courseCode: 'CS301',
    title: 'Database Systems',
    description: 'Design and implementation of database systems, including relational model, SQL, normalization, and transaction processing.',
    department: 'Computer Science',
    credits: 3,
    instructor: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@university.edu'
    },
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
    enrollmentCount: 18,
    availableSpots: 2,
    prerequisites: ['CS201'],
    difficulty: 'Advanced',
    tags: ['database', 'sql', 'normalization'],
    isActive: true,
    learningObjectives: [
      'Design relational databases',
      'Write complex SQL queries',
      'Understand database normalization'
    ],
    materials: [
      {
        title: 'Database System Concepts',
        type: 'textbook',
        required: true
      }
    ]
  },
  {
    _id: '6',
    courseCode: 'CS401',
    title: 'Software Engineering',
    description: 'Principles and practices of software engineering, including project management, design patterns, testing, and team collaboration.',
    department: 'Computer Science',
    credits: 4,
    instructor: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@university.edu'
    },
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
    enrollmentCount: 12,
    availableSpots: 3,
    prerequisites: ['CS201', 'CS301'],
    difficulty: 'Advanced',
    tags: ['software-engineering', 'project-management', 'testing'],
    isActive: true,
    learningObjectives: [
      'Apply software engineering principles',
      'Manage software projects',
      'Work effectively in teams'
    ],
    materials: [
      {
        title: 'Software Engineering: A Practitioner\'s Approach',
        type: 'textbook',
        required: true
      }
    ]
  }
];

const departments = [
  { value: '', label: 'All Departments' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'Business', label: 'Business' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Psychology', label: 'Psychology' },
];

const semesters = [
  { value: '', label: 'All Semesters' },
  { value: 'Fall', label: 'Fall' },
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
];

const difficulties = [
  { value: '', label: 'All Levels' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export const Courses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([
    '1', '3' // Mock enrolled course IDs
  ]);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedDepartment, selectedSemester, selectedDifficulty, courses]);

  const filterCourses = () => {
    let filtered = courses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }

    // Semester filter
    if (selectedSemester) {
      filtered = filtered.filter(course => course.semester === selectedSemester);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEnrolledCourses(prev => [...prev, courseId]);
      // Update course enrollment count
      setCourses(prev => prev.map(course => 
        course._id === courseId 
          ? { ...course, enrollmentCount: course.enrollmentCount + 1, availableSpots: course.availableSpots - 1 }
          : course
      ));
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (courseId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEnrolledCourses(prev => prev.filter(id => id !== courseId));
      // Update course enrollment count
      setCourses(prev => prev.map(course => 
        course._id === courseId 
          ? { ...course, enrollmentCount: course.enrollmentCount - 1, availableSpots: course.availableSpots + 1 }
          : course
      ));
    } catch (error) {
      console.error('Failed to drop course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600">
            {user?.role === 'student' ? 'Browse and enroll in courses' : 'Manage your courses'}
          </p>
        </div>
        {user?.role === 'instructor' && (
          <Link to="/instructor/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search courses, instructors..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={departments}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            />
            <Select
              options={semesters}
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            />
            <Select
              options={difficulties}
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course._id);
          const canEnroll = course.availableSpots > 0 && !isEnrolled && user?.role === 'student';

          return (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-indigo-600">
                        {course.courseCode}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Award className="h-4 w-4 mr-1" />
                      {course.credits} credits
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{course.department}</p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {course.schedule.days.join(', ')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {course.schedule.startTime} - {course.schedule.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {course.schedule.room}, {course.schedule.building}
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollmentCount}/{course.capacity} enrolled
                  </div>
                  <div className="text-sm text-gray-600">
                    {course.availableSpots} spots left
                  </div>
                </div>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.prerequisites.map((prereq, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {course.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      +{course.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link to={`/courses/${course._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  
                  {user?.role === 'student' && (
                    <>
                      {isEnrolled ? (
                        <Button
                          variant="danger"
                          onClick={() => handleDrop(course._id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Drop Course
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(course._id)}
                          disabled={!canEnroll || isLoading}
                          className="flex-1"
                        >
                          {course.availableSpots === 0 ? 'Full' : 'Enroll'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedDepartment('');
              setSelectedSemester('');
              setSelectedDifficulty('');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};