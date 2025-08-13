/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  BookOpen,
  Code,
  MessageSquare,
  Award,
  Edit,
  Eye,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDate, formatRelativeTime, getAssignmentTypeColor, isAssignmentOverdue } from '../lib/utils';
import toast from 'react-hot-toast';

// Define the type for the assignment
interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    courseCode: string;
    title: string;
  };
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: string;
  totalPoints: number;
  dueDate: string;
  assignedDate: string;
  isPublished: boolean;
  difficulty: string;
  estimatedTime: number;
  timeLimit?: number;
  maxAttempts: number;
  autoGrade: boolean;
  questions?: any[];
  rubric?: any[];
  submissions?: {
    _id: string;
    student: { _id: string; firstName: string; lastName: string; };
    submittedAt: string;
    content: string;
    attachments: any[];
    isLate: boolean;
    grade?: number;
    feedback?: string;
    gradedAt?: string;
  }[];
  allowLateSubmission?: boolean;
  latePenalty?: number;
}

const assignmentTypes = [
  { value: '', label: 'All Types' },
  { value: 'homework', label: 'Homework' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'lab', label: 'Lab' },
  { value: 'essay', label: 'Essay' },
];

const statusFilters = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'overdue', label: 'Overdue' },
];

export const Assignments: React.FC = () => {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const location = useLocation();

  // Fetches assignments from the API
  const fetchAssignments = useCallback(async () => {
    if (!token) {
      setError('Authentication token not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch assignments.');
      }

      const result = await response.json();
      setAssignments(result.data);
    } catch (err: any) {
      console.error('Fetch assignments error:', err);
      setError(err.message || 'A network error occurred.');
      toast.error('Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Initial fetch and check for create-assignment-redirect
  useEffect(() => {
    fetchAssignments();
    
    // Check if we were redirected from the CreateAssignment page
    if (location.state?.assignmentCreated) {
      toast.success("Assignment created successfully!");
      // Clear the state to prevent the toast from showing on subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [fetchAssignments, location.state]);

  // Use a memoized value for filtering to avoid unnecessary re-renders
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(assignment => assignment.type === selectedType);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(assignment => {
        // Use optional chaining here to safely access the submissions array
        const hasSubmission = assignment.submissions?.length > 0;
        const isOverdue = isAssignmentOverdue(assignment.dueDate);
        const isGraded = hasSubmission && assignment.submissions?.[0].grade !== undefined;

        switch (selectedStatus) {
          case 'pending':
            return !hasSubmission && !isOverdue;
          case 'submitted':
            return hasSubmission && !isGraded;
          case 'graded':
            return isGraded;
          case 'overdue':
            return isOverdue && !hasSubmission;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [searchQuery, selectedType, selectedStatus, assignments]);

  const getAssignmentStatus = (assignment: Assignment) => {
    // Use optional chaining here
    const hasSubmission = assignment.submissions?.length > 0;
    const isOverdue = isAssignmentOverdue(assignment.dueDate);
    // Use optional chaining here
    const isGraded = hasSubmission && assignment.submissions?.[0].grade !== undefined;

    if (isGraded) return { status: 'graded', color: 'text-green-600', icon: CheckCircle };
    if (hasSubmission) return { status: 'submitted', color: 'text-blue-600', icon: CheckCircle };
    if (isOverdue) return { status: 'overdue', color: 'text-red-600', icon: AlertCircle };
    return { status: 'pending', color: 'text-yellow-600', icon: Clock };
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return <CheckCircle className="h-4 w-4" />;
      case 'true-false':
        return <AlertCircle className="h-4 w-4" />;
      case 'short-answer':
        return <MessageSquare className="h-4 w-4" />;
      case 'essay':
        return <FileText className="h-4 w-4" />;
      case 'code':
        return <Code className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">
            {user?.role === 'student' ? 'View and complete your assignments' : 'Manage course assignments'}
          </p>
        </div>
        {user?.role === 'instructor' && (
          <div className="flex space-x-2">
            <Link to="/instructor/assignments/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </Link>
            <Link to="/instructor/quiz-builder">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Quiz Builder
              </Button>
            </Link>
          </div>
        )}
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
              options={assignmentTypes}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            />
            <Select
              options={statusFilters}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);
          const StatusIcon = status.icon;
          const isOverdue = isAssignmentOverdue(assignment.dueDate);
          // Use optional chaining for safe access
          const hasSubmission = assignment.submissions?.length > 0;

          return (
            <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Assignment Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getAssignmentTypeColor(assignment.type)}`}>
                        {assignment.type}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {assignment.course.courseCode}
                      </span>
                      <div className={`flex items-center space-x-1 ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">{status.status}</span>
                      </div>
                      {assignment.autoGrade && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          Auto-Graded
                        </span>
                      )}
                    </div>

                    {/* Assignment Title and Description */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {assignment.description}
                    </p>

                    {/* Assignment Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p>{formatDate(assignment.dueDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">Time Left</p>
                          <p>{formatRelativeTime(assignment.dueDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Award className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium">Points</p>
                          <p>{assignment.totalPoints} pts</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="font-medium">Difficulty</p>
                          <p>{assignment.difficulty}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quiz/Exam Questions Preview */}
                    {(assignment.type === 'quiz' || assignment.type === 'exam') && assignment.questions && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {assignment.questions.length} Questions • {assignment.timeLimit} minutes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {assignment.questions.slice(0, 5).map((question) => (
                            <div key={question.id} className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {getQuestionTypeIcon(question.type)}
                              <span>{question.type.replace('-', ' ')}</span>
                              <span>({question.points}pts)</span>
                            </div>
                          ))}
                          {assignment.questions.length > 5 && (
                            <span className="text-xs text-blue-600">+{assignment.questions.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex items-center space-x-6 text-xs text-gray-500 mb-4">
                      <span>Est. Time: {assignment.estimatedTime}h</span>
                      {assignment.timeLimit && (
                        <span>Time Limit: {assignment.timeLimit}min</span>
                      )}
                      <span>Max Attempts: {assignment.maxAttempts}</span>
                      {assignment.allowLateSubmission && (
                        <span>Late Penalty: {assignment.latePenalty}%</span>
                      )}
                    </div>

                    {/* Submission Info */}
                    {/* Use optional chaining for safe access */}
                    {hasSubmission && assignment.submissions && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">
                            ✅ Submitted: {formatRelativeTime(assignment.submissions[0].submittedAt)}
                          </span>
                          {assignment.submissions[0].grade !== undefined && (
                            <span className="text-lg font-bold text-green-800">
                              {assignment.submissions[0].grade}/{assignment.totalPoints} pts
                            </span>
                          )}
                        </div>
                        {assignment.submissions[0].feedback && (
                          <div className="bg-white rounded p-3 mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Instructor Feedback:</p>
                            <p className="text-sm text-gray-600">{assignment.submissions[0].feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <Link to={`/assignments/${assignment._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    
                    {/* Use optional chaining for safe access */}
                    {user?.role === 'student' && !hasSubmission && !isOverdue && (
                      <Link to={`/assignments/${assignment._id}/take`}>
                        <Button size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          {assignment.type === 'quiz' || assignment.type === 'exam' ? 'Start' : 'Submit'}
                        </Button>
                      </Link>
                    )}
                    
                    {user?.role === 'instructor' && (
                      <>
                        <Link to={`/instructor/assignments/${assignment._id}/submissions`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Submissions ({assignment.submissions?.length || 0})
                          </Button>
                        </Link>
                        <Link to={`/instructor/assignments/${assignment._id}/edit`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedType('');
              setSelectedStatus('');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
