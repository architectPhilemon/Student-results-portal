import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Filter,
  Search,
  Download,
  MessageSquare,
  Flag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDate, getGradeColor, getLetterGrade, calculateGPA } from '../lib/utils';

// Mock grades data
const mockGrades = [
  {
    _id: '1',
    student: {
      _id: 'student1',
      firstName: 'John',
      lastName: 'Smith',
      studentId: 'STU123456'
    },
    course: {
      _id: 'course1',
      courseCode: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 4
    },
    assignment: {
      _id: 'assign1',
      title: 'Python Basics Assignment',
      type: 'homework',
      totalPoints: 100
    },
    instructor: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson'
    },
    points: 85,
    totalPoints: 100,
    percentage: 85,
    letterGrade: 'B',
    feedback: 'Good work on the basics. Your code is clean and well-commented. Consider adding more test cases next time.',
    gradedDate: '2024-02-16T10:00:00Z',
    submissionDate: '2024-02-14T20:30:00Z',
    isLate: false,
    comments: [
      {
        author: {
          _id: 'inst1',
          firstName: 'Dr. Michael',
          lastName: 'Johnson',
          role: 'instructor'
        },
        content: 'Great improvement from your previous assignment!',
        timestamp: '2024-02-16T10:30:00Z'
      }
    ]
  },
  {
    _id: '2',
    student: {
      _id: 'student1',
      firstName: 'John',
      lastName: 'Smith',
      studentId: 'STU123456'
    },
    course: {
      _id: 'course1',
      courseCode: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 4
    },
    assignment: {
      _id: 'assign2',
      title: 'Control Structures Quiz',
      type: 'quiz',
      totalPoints: 50
    },
    instructor: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson'
    },
    points: 42,
    totalPoints: 50,
    percentage: 84,
    letterGrade: 'B',
    feedback: 'Solid understanding of control structures. Minor mistakes on loop conditions.',
    gradedDate: '2024-02-22T16:00:00Z',
    submissionDate: '2024-02-22T14:15:00Z',
    isLate: false,
    comments: []
  },
  {
    _id: '3',
    student: {
      _id: 'student1',
      firstName: 'John',
      lastName: 'Smith',
      studentId: 'STU123456'
    },
    course: {
      _id: 'course2',
      courseCode: 'MATH201',
      title: 'Calculus II',
      credits: 4
    },
    assignment: {
      _id: 'assign3',
      title: 'Integration Homework',
      type: 'homework',
      totalPoints: 80
    },
    instructor: {
      _id: 'inst2',
      firstName: 'Prof. Emily',
      lastName: 'Davis'
    },
    points: 72,
    totalPoints: 80,
    percentage: 90,
    letterGrade: 'A-',
    feedback: 'Excellent work on integration techniques. Your solutions are clear and well-organized.',
    gradedDate: '2024-02-20T11:15:00Z',
    submissionDate: '2024-02-18T21:00:00Z',
    isLate: false,
    comments: []
  }
];

const courseFilters = [
  { value: '', label: 'All Courses' },
  { value: 'CS101', label: 'CS101 - Intro to Computer Science' },
  { value: 'CS201', label: 'CS201 - Data Structures' },
  { value: 'MATH201', label: 'MATH201 - Calculus II' },
  { value: 'PHYS101', label: 'PHYS101 - General Physics I' },
];

const assignmentTypeFilters = [
  { value: '', label: 'All Types' },
  { value: 'homework', label: 'Homework' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'lab', label: 'Lab' },
];

export const Grades: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState(mockGrades);
  const [filteredGrades, setFilteredGrades] = useState(mockGrades);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    filterGrades();
  }, [searchQuery, selectedCourse, selectedType, grades]);

  const filterGrades = () => {
    let filtered = grades;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(grade =>
        grade.assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Course filter
    if (selectedCourse) {
      filtered = filtered.filter(grade => grade.course.courseCode === selectedCourse);
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(grade => grade.assignment.type === selectedType);
    }

    setFilteredGrades(filtered);
  };

  // Calculate statistics
  const calculateStats = () => {
    if (filteredGrades.length === 0) {
      return {
        averageGrade: 0,
        totalPoints: 0,
        earnedPoints: 0,
        gpa: 0,
        gradeDistribution: {}
      };
    }

    const totalPoints = filteredGrades.reduce((sum, grade) => sum + grade.totalPoints, 0);
    const earnedPoints = filteredGrades.reduce((sum, grade) => sum + grade.points, 0);
    const averageGrade = (earnedPoints / totalPoints) * 100;

    // Calculate GPA
    const courseGrades = filteredGrades.reduce((acc, grade) => {
      const courseId = grade.course._id;
      if (!acc[courseId]) {
        acc[courseId] = {
          grades: [],
          credits: grade.course.credits
        };
      }
      acc[courseId].grades.push(grade.percentage);
      return acc;
    }, {} as any);

    const gpa = calculateGPA(
      Object.values(courseGrades).map((course: any) => ({
        percentage: course.grades.reduce((sum: number, g: number) => sum + g, 0) / course.grades.length,
        credits: course.credits
      }))
    );

    // Grade distribution
    const gradeDistribution = filteredGrades.reduce((dist, grade) => {
      const letter = grade.letterGrade;
      dist[letter] = (dist[letter] || 0) + 1;
      return dist;
    }, {} as any);

    return {
      averageGrade: Math.round(averageGrade * 100) / 100,
      totalPoints,
      earnedPoints,
      gpa: Math.round(gpa * 100) / 100,
      gradeDistribution
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600">
            {user?.role === 'student' ? 'View your academic performance' : 'Manage student grades'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current GPA</p>
              <p className="text-2xl font-bold text-gray-900">{stats.gpa}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Points Earned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.earnedPoints}/{stats.totalPoints}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{filteredGrades.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search assignments..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={courseFilters}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            />
            <Select
              options={assignmentTypeFilters}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grades List */}
      <div className="space-y-4">
        {filteredGrades.map((grade) => (
          <Card key={grade._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Grade Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {grade.course.courseCode}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {grade.assignment.type}
                    </span>
                    {grade.isLate && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Late
                      </span>
                    )}
                  </div>

                  {/* Assignment Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {grade.assignment.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {grade.course.title}
                  </p>

                  {/* Grade Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Score</p>
                      <p className={`text-lg font-bold ${getGradeColor(grade.points, grade.totalPoints)}`}>
                        {grade.points}/{grade.totalPoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Percentage</p>
                      <p className={`text-lg font-bold ${getGradeColor(grade.points, grade.totalPoints)}`}>
                        {grade.percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Letter Grade</p>
                      <p className={`text-lg font-bold ${getGradeColor(grade.points, grade.totalPoints)}`}>
                        {grade.letterGrade}
                      </p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {grade.feedback && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Instructor Feedback:</p>
                      <p className="text-sm text-gray-600">{grade.feedback}</p>
                    </div>
                  )}

                  {/* Comments */}
                  {grade.comments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Comments:</p>
                      {grade.comments.map((comment, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-blue-800">
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                            <span className="text-xs text-blue-600">
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted: {formatDate(grade.submissionDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Graded: {formatDate(grade.gradedDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                  {user?.role === 'student' && (
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4 mr-1" />
                      Request Review
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredGrades.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCourse('');
              setSelectedType('');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};