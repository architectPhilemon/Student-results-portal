import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define the type for a course
interface Course {
  _id: string;
  title: string;
  courseCode: string;
}

// Define the type for the form data state
interface FormData {
  title: string;
  description: string;
  course: string;
  type: string;
  totalPoints: number | '';
  dueDate: string;
  instructions: string;
  allowLateSubmission: boolean;
  latePenalty: number | '';
  maxAttempts: number | '';
  timeLimit: number | '';
  difficulty: string;
  isPublished: boolean;
}

const CreateAssignment: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    course: '',
    type: '',
    totalPoints: '',
    dueDate: '',
    instructions: '',
    allowLateSubmission: true,
    latePenalty: 10,
    maxAttempts: 1,
    timeLimit: '',
    difficulty: 'Medium',
    isPublished: false,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch courses from the backend on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) {
        setError('Authentication token not found.');
        setLoadingCourses(false);
        return;
      }
      try {
        const response = await fetch('/api/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        
        if (response.ok) {
          setCourses(result.data);
        } else {
          setError(result.message || 'Failed to fetch courses.');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('A network error occurred while fetching courses.');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [token]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Authentication token not found. Please log in.');
      return;
    }
    
    // Ensure a course is selected
    if (!formData.course) {
      toast.error('Please select a course for the assignment.');
      return;
    }

    const loadingToast = toast.loading('Creating assignment...');

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Assignment created successfully!', { id: loadingToast });
        console.log('Server response:', result);
        // Navigate with state to trigger a refresh on the assignments page
        navigate('/assignments', { state: { assignmentCreated: true } });
      } else {
        toast.error(result.message || 'Failed to create assignment.', { id: loadingToast });
        console.error('Server error:', result.error);
      }
    } catch (error) {
      console.error('Network or server error:', error);
      toast.error('A network error occurred. Please try again.', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
          Create New Assignment
        </h1>
        <p className="text-center text-gray-500">
          Fill out the details below to create a new assignment for your students.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
              />
            </div>
            {/* Course Dropdown */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              {loadingCourses ? (
                <div className="mt-1 block w-full text-center text-sm text-gray-500">
                  Loading courses...
                </div>
              ) : error ? (
                <div className="mt-1 block w-full text-center text-sm text-red-500">
                  {error}
                </div>
              ) : (
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  required
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode}: {course.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {/* Description and Instructions */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={4}
              value={formData.instructions}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>

          {/* Assignment Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
              >
                <option value="" disabled>Select a type</option>
                <option value="homework">Homework</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="essay">Essay</option>
              </select>
            </div>
            {/* Total Points */}
            <div>
              <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">
                Total Points
              </label>
              <input
                type="number"
                id="totalPoints"
                name="totalPoints"
                value={formData.totalPoints}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
                min="1"
              />
            </div>
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
              />
            </div>
            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            {/* Time Limit */}
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (mins)
              </label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                min="1"
              />
            </div>
            {/* Max Attempts */}
            <div>
              <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                id="maxAttempts"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                min="1"
              />
            </div>
          </div>
          
          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allow Late Submission */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowLateSubmission"
                name="allowLateSubmission"
                checked={formData.allowLateSubmission}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="allowLateSubmission" className="text-sm font-medium text-gray-700">
                Allow Late Submissions
              </label>
            </div>
            {/* Is Published */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publish Immediately
              </label>
            </div>
          </div>

          {/* Create Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
