import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  Flag,
  Eye,
  EyeOff,
  Code,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Textarea } from '../components/UI/Input';
import { formatRelativeTime } from '../lib/utils';
import toast from 'react-hot-toast';

// Mock assignment data for taking
const mockAssignment = {
  _id: '1',
  title: 'Python Fundamentals Quiz',
  description: 'Test your understanding of Python basics including variables, data types, operators, and control structures.',
  course: {
    courseCode: 'CS101',
    title: 'Introduction to Computer Science'
  },
  type: 'quiz',
  totalPoints: 100,
  timeLimit: 45,
  maxAttempts: 2,
  dueDate: '2024-03-15T23:59:00Z',
  autoGrade: true,
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Which of the following is the correct way to declare a variable in Python?',
      options: ['var x = 5', 'int x = 5', 'x = 5', 'declare x = 5'],
      correctAnswer: 2,
      points: 10,
      explanation: 'In Python, variables are declared by simply assigning a value using the = operator.'
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What is the output of: print(type(3.14))?',
      options: ['<class \'int\'>', '<class \'float\'>', '<class \'str\'>', '<class \'decimal\'>'],
      correctAnswer: 1,
      points: 10,
      explanation: '3.14 is a floating-point number, so type() returns <class \'float\'>.'
    },
    {
      id: 'q3',
      type: 'true-false',
      question: 'Python is case-sensitive.',
      correctAnswer: 'true',
      points: 5,
      explanation: 'Python is case-sensitive, meaning "Variable" and "variable" are different identifiers.'
    },
    {
      id: 'q4',
      type: 'short-answer',
      question: 'Write a Python statement to create a list containing the numbers 1, 2, 3, 4, 5.',
      correctAnswer: '[1, 2, 3, 4, 5]',
      points: 15,
      explanation: 'Lists in Python are created using square brackets with comma-separated values.'
    },
    {
      id: 'q5',
      type: 'code',
      question: 'Write a Python function called "calculate_area" that takes radius as parameter and returns the area of a circle. Use 3.14159 for pi.',
      correctAnswer: 'def calculate_area(radius):\n    pi = 3.14159\n    return pi * radius * radius',
      points: 25,
      explanation: 'The area of a circle is π × r². The function should multiply pi by the square of the radius.'
    },
    {
      id: 'q6',
      type: 'multiple-choice',
      question: 'Which loop is best for iterating over a list in Python?',
      options: ['while loop', 'for loop', 'do-while loop', 'repeat loop'],
      correctAnswer: 1,
      points: 10,
      explanation: 'For loops are the most Pythonic way to iterate over sequences like lists.'
    },
    {
      id: 'q7',
      type: 'essay',
      question: 'Explain the difference between a list and a tuple in Python. Provide examples and discuss when you would use each.',
      points: 25,
      explanation: 'Lists are mutable (can be changed) while tuples are immutable (cannot be changed). Lists use [], tuples use ().'
    }
  ]
};

export const AssignmentTaker: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(mockAssignment);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [startTime] = useState(new Date());

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAutoSubmit = async () => {
    toast.error('Time expired! Submitting automatically...');
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Calculate score for auto-graded assignments
      let totalScore = 0;
      let maxScore = 0;

      if (assignment.autoGrade) {
        assignment.questions.forEach(question => {
          maxScore += question.points;
          const userAnswer = answers[question.id];
          
          if (question.type === 'multiple-choice' && userAnswer === question.correctAnswer) {
            totalScore += question.points;
          } else if (question.type === 'true-false' && userAnswer === question.correctAnswer) {
            totalScore += question.points;
          } else if (question.type === 'short-answer' && userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
            totalScore += question.points;
          }
          // Essay and code questions need manual grading
        });
      }

      const submissionData = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
          timeSpent: Math.floor(Math.random() * 120) // Mock time spent per question
        })),
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        startedAt: startTime.toISOString(),
        completedAt: new Date().toISOString(),
        autoGraded: assignment.autoGrade,
        ...(assignment.autoGrade && { grade: totalScore })
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Assignment submitted successfully!');
      navigate('/assignments', { 
        state: { 
          message: assignment.autoGrade 
            ? `Quiz submitted! Your score: ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore)*100)}%)`
            : 'Assignment submitted successfully! You will receive your grade once reviewed.'
        }
      });
    } catch (error) {
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: any, index: number) => {
    const userAnswer = answers[question.id];

    return (
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Question {index + 1} of {assignment.questions.length}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                {question.points} points
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded capitalize">
                {question.type.replace('-', ' ')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {question.question}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFlag(question.id)}
            className={flaggedQuestions.has(question.id) ? 'text-red-600' : 'text-gray-400'}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>

        {/* Question Content */}
        <div className="space-y-3">
          {question.type === 'multiple-choice' && (
            <div className="space-y-2">
              {question.options.map((option: string, optionIndex: number) => (
                <label
                  key={optionIndex}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    userAnswer === optionIndex
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={optionIndex}
                    checked={userAnswer === optionIndex}
                    onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'true-false' && (
            <div className="space-y-2">
              {['true', 'false'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    userAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={userAnswer === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900 capitalize">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'short-answer' && (
            <Input
              placeholder="Enter your answer..."
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full"
            />
          )}

          {question.type === 'essay' && (
            <Textarea
              placeholder="Write your essay response here..."
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={8}
              className="w-full"
            />
          )}

          {question.type === 'code' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Code className="h-4 w-4" />
                <span>Write your Python code below:</span>
              </div>
              <Textarea
                placeholder="# Write your Python code here..."
                value={userAnswer || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                rows={10}
                className="w-full font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Show explanation if enabled */}
        {showExplanations && question.explanation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Explanation</span>
            </div>
            <p className="text-sm text-yellow-700">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / assignment.questions.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/assignments')}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-600">{assignment.course.courseCode} - {assignment.course.title}</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowExplanations(!showExplanations)}
              className="text-gray-600"
            >
              {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {getAnsweredCount()}/{assignment.questions.length} questions</span>
            <span>{getProgressPercentage()}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
          <div className="space-y-2">
            {assignment.questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isFlagged = flaggedQuestions.has(question.id);
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : isAnswered
                      ? 'bg-green-50 text-green-800 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{index + 1}</span>
                    {isAnswered && <CheckCircle className="h-3 w-3" />}
                    {isFlagged && <Flag className="h-3 w-3 text-red-500" />}
                  </div>
                  <span className="text-xs">{question.points}pts</span>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-medium">{getAnsweredCount()}</span>
              </div>
              <div className="flex justify-between">
                <span>Flagged:</span>
                <span className="font-medium">{flaggedQuestions.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-medium">{assignment.questions.length - getAnsweredCount()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-8">
              {renderQuestion(assignment.questions[currentQuestion], currentQuestion)}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              
              {currentQuestion === assignment.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(assignment.questions.length - 1, currentQuestion + 1))}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Warning for unanswered questions */}
          {currentQuestion === assignment.questions.length - 1 && getAnsweredCount() < assignment.questions.length && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    You have {assignment.questions.length - getAnsweredCount()} unanswered questions
                  </p>
                  <p className="text-sm text-yellow-700">
                    Review your answers before submitting. Unanswered questions will receive 0 points.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};