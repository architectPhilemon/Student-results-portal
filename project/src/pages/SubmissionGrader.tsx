import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Clock,
  Award,
  MessageSquare,
  Save,
  Send,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Code,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Textarea } from '../components/UI/Input';
import { formatDate, formatRelativeTime } from '../lib/utils';
import toast from 'react-hot-toast';

// Mock submission data for grading
const mockSubmission = {
  _id: 'sub1',
  assignment: {
    _id: '1',
    title: 'Python Fundamentals Quiz',
    type: 'quiz',
    totalPoints: 100,
    autoGrade: true,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which of the following is the correct way to declare a variable in Python?',
        options: ['var x = 5', 'int x = 5', 'x = 5', 'declare x = 5'],
        correctAnswer: 2,
        points: 10
      },
      {
        id: 'q2',
        type: 'essay',
        question: 'Explain the difference between a list and a tuple in Python.',
        points: 25
      },
      {
        id: 'q3',
        type: 'code',
        question: 'Write a function to calculate the factorial of a number.',
        points: 30
      }
    ]
  },
  student: {
    _id: 'student1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@student.edu',
    studentId: 'STU123456'
  },
  submittedAt: '2024-03-10T14:30:00Z',
  timeSpent: 2340, // seconds
  answers: [
    {
      questionId: 'q1',
      answer: 2,
      timeSpent: 45
    },
    {
      questionId: 'q2',
      answer: 'Lists are mutable data structures that can be modified after creation, while tuples are immutable and cannot be changed. Lists use square brackets [] and tuples use parentheses (). Lists are better for data that changes, tuples for fixed data like coordinates.',
      timeSpent: 420
    },
    {
      questionId: 'q3',
      answer: 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n - 1)',
      timeSpent: 600
    }
  ],
  isLate: false,
  autoGraded: true,
  grade: 65, // Auto-calculated for MC questions, pending for essay/code
  feedback: ''
};

export const SubmissionGrader: React.FC = () => {
  const { assignmentId, studentId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(mockSubmission);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize grades for manual grading questions
    const initialGrades: Record<string, number> = {};
    const initialFeedback: Record<string, string> = {};
    
    submission.assignment.questions.forEach(question => {
      if (question.type === 'essay' || question.type === 'code') {
        initialGrades[question.id] = 0;
        initialFeedback[question.id] = '';
      }
    });
    
    setGrades(initialGrades);
    setFeedback(initialFeedback);
  }, []);

  const getQuestionGrade = (question: any) => {
    const answer = submission.answers.find(a => a.questionId === question.id);
    
    if (question.type === 'multiple-choice') {
      return answer?.answer === question.correctAnswer ? question.points : 0;
    } else if (question.type === 'true-false') {
      return answer?.answer === question.correctAnswer ? question.points : 0;
    } else if (question.type === 'short-answer') {
      // Simple string comparison for auto-grading
      const userAnswer = answer?.answer?.toLowerCase().trim();
      const correctAnswer = question.correctAnswer?.toLowerCase().trim();
      return userAnswer === correctAnswer ? question.points : 0;
    }
    
    // Manual grading for essay and code
    return grades[question.id] || 0;
  };

  const getTotalGrade = () => {
    return submission.assignment.questions.reduce((total, question) => {
      return total + getQuestionGrade(question);
    }, 0);
  };

  const handleGradeChange = (questionId: string, grade: number) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: Math.max(0, grade)
    }));
  };

  const handleFeedbackChange = (questionId: string, feedbackText: string) => {
    setFeedback(prev => ({
      ...prev,
      [questionId]: feedbackText
    }));
  };

  const handleSubmitGrade = async () => {
    setIsLoading(true);
    try {
      const finalGrade = getTotalGrade();
      const gradeData = {
        grade: finalGrade,
        totalPoints: submission.assignment.totalPoints,
        feedback: overallFeedback,
        questionGrades: grades,
        questionFeedback: feedback,
        gradedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Grade submitted successfully!');
      navigate(`/instructor/assignments/${assignmentId}/submissions`);
    } catch (error) {
      toast.error('Failed to submit grade');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionGrading = (question: any, index: number) => {
    const answer = submission.answers.find(a => a.questionId === question.id);
    const isAutoGraded = ['multiple-choice', 'true-false', 'short-answer'].includes(question.type);
    const questionGrade = getQuestionGrade(question);
    const isCorrect = questionGrade === question.points;

    return (
      <Card key={question.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Question {index + 1} of {submission.assignment.questions.length}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {question.type.replace('-', ' ')}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                {question.points} points
              </span>
              {isAutoGraded && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{question.question}</p>
            </div>

            {/* Student Answer */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Student Answer:</h4>
              {question.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {question.options.map((option: string, optionIndex: number) => (
                    <div
                      key={optionIndex}
                      className={`p-3 border rounded-lg ${
                        answer?.answer === optionIndex
                          ? optionIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : optionIndex === question.correctAnswer
                          ? 'border-green-300 bg-green-25'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {answer?.answer === optionIndex && (
                          <div className={`w-4 h-4 rounded-full ${
                            optionIndex === question.correctAnswer ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        )}
                        {answer?.answer !== optionIndex && optionIndex === question.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'true-false' && (
                <div className="flex space-x-4">
                  <div className={`p-3 border rounded-lg ${
                    answer?.answer === 'true'
                      ? question.correctAnswer === 'true'
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : question.correctAnswer === 'true'
                      ? 'border-green-300 bg-green-25'
                      : 'border-gray-200'
                  }`}>
                    True {answer?.answer === 'true' && (question.correctAnswer === 'true' ? '✓' : '✗')}
                  </div>
                  <div className={`p-3 border rounded-lg ${
                    answer?.answer === 'false'
                      ? question.correctAnswer === 'false'
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : question.correctAnswer === 'false'
                      ? 'border-green-300 bg-green-25'
                      : 'border-gray-200'
                  }`}>
                    False {answer?.answer === 'false' && (question.correctAnswer === 'false' ? '✓' : '✗')}
                  </div>
                </div>
              )}

              {(question.type === 'short-answer' || question.type === 'essay') && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-800">{answer?.answer || 'No answer provided'}</pre>
                </div>
              )}

              {question.type === 'code' && (
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <pre className="text-sm font-mono overflow-x-auto">
                    <code>{answer?.answer || '# No code provided'}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Correct Answer (for reference) */}
            {question.correctAnswer && !isAutoGraded && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Expected Answer:</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <pre className="whitespace-pre-wrap text-blue-800 text-sm">{question.correctAnswer}</pre>
                </div>
              </div>
            )}

            {/* Manual Grading */}
            {!isAutoGraded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <Input
                  label={`Points (out of ${question.points})`}
                  type="number"
                  min="0"
                  max={question.points}
                  value={grades[question.id] || 0}
                  onChange={(e) => handleGradeChange(question.id, parseInt(e.target.value) || 0)}
                />
                <div className="md:col-span-1">
                  <Textarea
                    label="Feedback for this question"
                    placeholder="Provide specific feedback..."
                    value={feedback[question.id] || ''}
                    onChange={(e) => handleFeedbackChange(question.id, e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Auto-graded result */}
            {isAutoGraded && (
              <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {questionGrade}/{question.points} points
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/instructor/assignments/${assignmentId}/submissions`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
            <p className="text-gray-600">{submission.assignment.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {getTotalGrade()}/{submission.assignment.totalPoints}
          </p>
          <p className="text-sm text-gray-600">
            {Math.round((getTotalGrade() / submission.assignment.totalPoints) * 100)}%
          </p>
        </div>
      </div>

      {/* Student Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {submission.student.firstName[0]}{submission.student.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {submission.student.firstName} {submission.student.lastName}
                </p>
                <p className="text-sm text-gray-600">{submission.student.studentId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Submitted</p>
                <p className="text-sm text-gray-600">{formatRelativeTime(submission.submittedAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time Spent</p>
                <p className="text-sm text-gray-600">{Math.floor(submission.timeSpent / 60)} minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {submission.isLate ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                <p className={`text-sm ${submission.isLate ? 'text-red-600' : 'text-green-600'}`}>
                  {submission.isLate ? 'Late Submission' : 'On Time'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions and Answers */}
      <div className="space-y-6">
        {submission.assignment.questions.map((question, index) => 
          renderQuestionGrading(question, index)
        )}
      </div>

      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Provide overall feedback for the student..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Grade Summary and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Grade Summary</h3>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Total Score:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    {getTotalGrade()}/{submission.assignment.totalPoints}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Percentage:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    {Math.round((getTotalGrade() / submission.assignment.totalPoints) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Letter Grade:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    {getTotalGrade() >= submission.assignment.totalPoints * 0.9 ? 'A' :
                     getTotalGrade() >= submission.assignment.totalPoints * 0.8 ? 'B' :
                     getTotalGrade() >= submission.assignment.totalPoints * 0.7 ? 'C' :
                     getTotalGrade() >= submission.assignment.totalPoints * 0.6 ? 'D' : 'F'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmitGrade} isLoading={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                Submit Grade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};