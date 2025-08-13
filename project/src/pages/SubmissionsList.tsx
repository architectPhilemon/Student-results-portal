import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  BarChart3,
  Filter,
  Search,
  FileText,
  User
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { formatDate, formatRelativeTime, getGradeColor } from '../lib/utils';

// Mock submissions data
const mockSubmissions = [
  {
    _id: 'sub1',
    student: {
      _id: 'student1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@student.edu',
      studentId: 'STU123456'
    },
    submittedAt: '2024-03-10T14:30:00Z',
    timeSpent: 2340,
    isLate: false,
    grade: 85,
    totalPoints: 100,
    feedback: 'Good understanding of Python basics. Well-structured code.',
    gradedAt: '2024-03-11T10:15:00Z',
    autoGraded: true
  },
  {
    _id: 'sub2',
    student: {
      _id: 'student2',
      firstName: 'Emma',
      lastName: 'Williams',
      email: 'emma.williams@student.edu',
      studentId: 'STU123457'
    },
    submittedAt: '2024-03-10T16:45:00Z',
    timeSpent: 1980,
    isLate: false,
    grade: 92,
    totalPoints: 100,
    feedback: 'Excellent work! Clear understanding of all concepts.',
    gradedAt: '2024-03-11T10:20:00Z',
    autoGraded: true
  },
  {
    _id: 'sub3',
    student: {
      _id: 'student3',
      firstName: 'Alex',
      lastName: 'Brown',
      email: 'alex.brown@student.edu',
      studentId: 'STU123458'
    },
    submittedAt: '2024-03-11T02:15:00Z',
    timeSpent: 3600,
    isLate: true,
    grade: undefined,
    totalPoints: 100,
    feedback: '',
    gradedAt: undefined,
    autoGraded: false
  },
  {
    _id: 'sub4',
    student: {
      _id: 'student4',
      firstName: 'Sophia',
      lastName: 'Garcia',
      email: 'sophia.garcia@student.edu',
      studentId: 'STU123459'
    },
    submittedAt: '2024-03-10T20:30:00Z',
    timeSpent: 2700,
    isLate: false,
    grade: 78,
    totalPoints: 100,
    feedback: 'Good effort. Review loop concepts for better understanding.',
    gradedAt: '2024-03-11T11:00:00Z',
    autoGraded: true
  }
];

const mockAssignment = {
  _id: '1',
  title: 'Python Fundamentals Quiz',
  course: {
    courseCode: 'CS101',
    title: 'Introduction to Computer Science'
  },
  type: 'quiz',
  totalPoints: 100,
  dueDate: '2024-03-15T23:59:00Z',
  timeLimit: 45,
  submissionCount: 4,
  averageGrade: 85
};

const statusFilters = [
  { value: '', label: 'All Submissions' },
  { value: 'graded', label: 'Graded' },
  { value: 'pending', label: 'Pending Grade' },
  { value: 'late', label: 'Late Submissions' },
];

export const SubmissionsList: React.FC = () => {
  const { assignmentId } = useParams();
  const [assignment] = useState(mockAssignment);
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [filteredSubmissions, setFilteredSubmissions] = useState(mockSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  React.useEffect(() => {
    filterSubmissions();
  }, [searchQuery, selectedStatus]);

  const filterSubmissions = () => {
    let filtered = submissions;

    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(sub => {
        switch (selectedStatus) {
          case 'graded':
            return sub.grade !== undefined;
          case 'pending':
            return sub.grade === undefined;
          case 'late':
            return sub.isLate;
          default:
            return true;
        }
      });
    }

    setFilteredSubmissions(filtered);
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.grade !== undefined).length;
    const pending = total - graded;
    const late = submissions.filter(s => s.isLate).length;
    const average = submissions
      .filter(s => s.grade !== undefined)
      .reduce((sum, s) => sum + (s.grade || 0), 0) / (graded || 1);

    return { total, graded, pending, late, average };
  };

  const stats = getSubmissionStats();

  const exportGrades = () => {
    const csvContent = [
      ['Student Name', 'Student ID', 'Email', 'Submitted At', 'Grade', 'Percentage', 'Status'],
      ...submissions.map(sub => [
        `${sub.student.firstName} ${sub.student.lastName}`,
        sub.student.studentId,
        sub.student.email,
        formatDate(sub.submittedAt),
        sub.grade || 'Pending',
        sub.grade ? `${Math.round((sub.grade / sub.totalPoints) * 100)}%` : 'Pending',
        sub.isLate ? 'Late' : 'On Time'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, '_')}_grades.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
            <p className="text-gray-600">{assignment.title} - {assignment.course.courseCode}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportGrades}>
            <Download className="h-4 w-4 mr-2" />
            Export Grades
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-xl font-bold text-gray-900">{stats.graded}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-xl font-bold text-gray-900">{stats.late}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Average</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(stats.average)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search students..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={statusFilters}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Student Avatar */}
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {submission.student.firstName[0]}{submission.student.lastName[0]}
                  </div>
                  
                  {/* Student Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {submission.student.firstName} {submission.student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{submission.student.studentId}</p>
                    <p className="text-sm text-gray-500">{submission.student.email}</p>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Submitted</p>
                    <p className="font-medium">{formatDate(submission.submittedAt)}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(submission.submittedAt)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600">Time Spent</p>
                    <p className="font-medium">{Math.floor(submission.timeSpent / 60)}m</p>
                    <p className="text-xs text-gray-500">
                      {submission.timeSpent > assignment.timeLimit * 60 ? 'Over limit' : 'Within limit'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600">Status</p>
                    <div className="flex items-center justify-center space-x-1">
                      {submission.isLate ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className={submission.isLate ? 'text-red-600' : 'text-green-600'}>
                        {submission.isLate ? 'Late' : 'On Time'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600">Grade</p>
                    {submission.grade !== undefined ? (
                      <>
                        <p className={`font-bold text-lg ${getGradeColor(submission.grade, submission.totalPoints)}`}>
                          {submission.grade}/{submission.totalPoints}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round((submission.grade / submission.totalPoints) * 100)}%
                        </p>
                      </>
                    ) : (
                      <p className="text-yellow-600 font-medium">Pending</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Link to={`/instructor/assignments/${assignmentId}/submissions/${submission.student._id}/grade`}>
                    <Button size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      {submission.grade !== undefined ? 'Review' : 'Grade'}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Feedback Preview */}
              {submission.feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{submission.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubmissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600">
              {submissions.length === 0 
                ? 'No students have submitted this assignment yet.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};