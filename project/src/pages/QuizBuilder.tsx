import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  Clock,
  Award,
  BookOpen,
  Code,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Textarea, Select } from '../components/UI/Input';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'code', label: 'Code' },
];

const courses = [
  { value: 'course1', label: 'CS101 - Introduction to Computer Science' },
  { value: 'course2', label: 'CS201 - Data Structures and Algorithms' },
  { value: 'course3', label: 'MATH201 - Calculus II' },
  { value: 'course4', label: 'PHYS101 - General Physics I' },
  { value: 'course5', label: 'CS301 - Database Systems' },
];

const assignmentTypes = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'homework', label: 'Homework' },
  { value: 'project', label: 'Project' },
];

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string | number;
  points: number;
  explanation: string;
}

export const QuizBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Assignment settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [type, setType] = useState('quiz');
  const [timeLimit, setTimeLimit] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [autoGrade, setAutoGrade] = useState(true);
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [latePenalty, setLatePenalty] = useState(10);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      explanation: ''
    }
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < questions.length - 1)
    ) {
      const newQuestions = [...questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ));
  };

  const getTotalPoints = () => {
    return questions.reduce((total, q) => total + q.points, 0);
  };

  const validateAssignment = () => {
    if (!title.trim()) {
      toast.error('Assignment title is required');
      return false;
    }
    if (!description.trim()) {
      toast.error('Assignment description is required');
      return false;
    }
    if (!course) {
      toast.error('Please select a course');
      return false;
    }
    if (!dueDate) {
      toast.error('Due date is required');
      return false;
    }
    if (new Date(dueDate) <= new Date()) {
      toast.error('Due date must be in the future');
      return false;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return false;
      }
      if (q.points <= 0) {
        toast.error(`Question ${i + 1} must have points greater than 0`);
        return false;
      }
      if (q.type === 'multiple-choice' && q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async (publish: boolean = false) => {
    if (!validateAssignment()) return;

    setIsLoading(true);
    try {
      const assignmentData = {
        title,
        description,
        course,
        type,
        totalPoints: getTotalPoints(),
        dueDate,
        timeLimit: type === 'quiz' || type === 'exam' ? timeLimit : undefined,
        maxAttempts,
        autoGrade,
        allowLateSubmission,
        latePenalty,
        questions,
        isPublished: publish,
        instructor: user?._id
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(publish ? 'Assignment published successfully!' : 'Assignment saved as draft!');
      navigate('/assignments');
    } catch (error) {
      toast.error('Failed to save assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionEditor = (question: Question, index: number) => {
    return (
      <Card key={question.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveQuestion(question.id, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveQuestion(question.id, 'down')}
                disabled={index === questions.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
                disabled={questions.length === 1}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Question Type and Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Question Type"
                options={questionTypes}
                value={question.type}
                onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
              />
              <Input
                label="Points"
                type="number"
                min="1"
                value={question.points}
                onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
              />
            </div>

            {/* Question Text */}
            <Textarea
              label="Question"
              placeholder="Enter your question here..."
              value={question.question}
              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
              rows={3}
            />

            {/* Question Type Specific Fields */}
            {question.type === 'multiple-choice' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Answer Options</label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                      className="text-green-600"
                    />
                    <Input
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                      className="flex-1"
                    />
                    {question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(question.id, optionIndex)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  disabled={question.options.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {question.type === 'true-false' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      value="true"
                      checked={question.correctAnswer === 'true'}
                      onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                      className="mr-2"
                    />
                    True
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      value="false"
                      checked={question.correctAnswer === 'false'}
                      onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                      className="mr-2"
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            {(question.type === 'short-answer' || question.type === 'code') && (
              <div>
                <Textarea
                  label="Correct Answer (for auto-grading)"
                  placeholder="Enter the correct answer or sample solution..."
                  value={question.correctAnswer as string || ''}
                  onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                  rows={question.type === 'code' ? 6 : 2}
                  className={question.type === 'code' ? 'font-mono text-sm' : ''}
                />
              </div>
            )}

            {/* Explanation */}
            <Textarea
              label="Explanation (Optional)"
              placeholder="Explain the correct answer or provide additional context..."
              value={question.explanation}
              onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Builder</h1>
          <p className="text-gray-600">Create interactive quizzes and assignments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/assignments')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} isLoading={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} isLoading={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Assignment Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Assignment Title"
                placeholder="Enter assignment title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <Textarea
                label="Description"
                placeholder="Describe what this assignment covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <Select
                label="Course"
                options={[{ value: '', label: 'Select a course' }, ...courses]}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />

              <Select
                label="Assignment Type"
                options={assignmentTypes}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Due Date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              {(type === 'quiz' || type === 'exam') && (
                <Input
                  label="Time Limit (minutes)"
                  type="number"
                  min="5"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                />
              )}

              <Input
                label="Maximum Attempts"
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Auto-Grade</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoGrade}
                      onChange={(e) => setAutoGrade(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Allow Late Submission</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowLateSubmission}
                      onChange={(e) => setAllowLateSubmission(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {allowLateSubmission && (
                  <Input
                    label="Late Penalty (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={latePenalty}
                    onChange={(e) => setLatePenalty(parseInt(e.target.value) || 0)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Assignment Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>{questions.length} Questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-green-500" />
                <span>{getTotalPoints()} Total Points</span>
              </div>
              {(type === 'quiz' || type === 'exam') && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>{timeLimit} Minutes</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                {autoGrade ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span>{autoGrade ? 'Auto-Graded' : 'Manual Grading'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Questions</h2>
          <Button onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, index) => renderQuestionEditor(question, index))}
      </div>

      {/* Save Actions */}
      <div className="flex justify-end space-x-4 pb-8">
        <Button variant="outline" onClick={() => navigate('/assignments')}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => handleSave(false)} isLoading={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button onClick={() => handleSave(true)} isLoading={isLoading}>
          <Eye className="h-4 w-4 mr-2" />
          Publish Assignment
        </Button>
      </div>
    </div>
  );
};