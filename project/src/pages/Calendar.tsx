import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  MapPin,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Select } from '../components/UI/Input';
import { formatDate, getAssignmentTypeColor } from '../lib/utils';

// Mock calendar events
const mockEvents = [
  {
    id: '1',
    title: 'CS101 - Python Assignment Due',
    type: 'assignment',
    course: 'CS101',
    date: '2024-02-20',
    time: '23:59',
    location: 'Online',
    description: 'Python basics assignment submission deadline',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Data Structures Quiz',
    type: 'quiz',
    course: 'CS201',
    date: '2024-02-25',
    time: '14:30',
    location: 'Room 205',
    description: 'Online quiz covering arrays and linked lists',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Physics Lab Session',
    type: 'lab',
    course: 'PHYS101',
    date: '2024-02-22',
    time: '10:00',
    location: 'Physics Lab 150',
    description: 'Pendulum motion experiment',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Office Hours - Dr. Johnson',
    type: 'office-hours',
    course: 'CS101',
    date: '2024-02-21',
    time: '15:00',
    location: 'CS Building 301',
    description: 'Weekly office hours for CS101 students',
    priority: 'low'
  },
  {
    id: '5',
    title: 'Midterm Exam - Calculus II',
    type: 'exam',
    course: 'MATH201',
    date: '2024-03-15',
    time: '14:00',
    location: 'Math Building 301',
    description: 'Comprehensive midterm covering chapters 1-8',
    priority: 'high'
  }
];

const eventTypes = [
  { value: '', label: 'All Events' },
  { value: 'assignment', label: 'Assignments' },
  { value: 'quiz', label: 'Quizzes' },
  { value: 'exam', label: 'Exams' },
  { value: 'lab', label: 'Labs' },
  { value: 'office-hours', label: 'Office Hours' },
  { value: 'class', label: 'Classes' },
];

const courses = [
  { value: '', label: 'All Courses' },
  { value: 'CS101', label: 'CS101 - Intro to Computer Science' },
  { value: 'CS201', label: 'CS201 - Data Structures' },
  { value: 'MATH201', label: 'MATH201 - Calculus II' },
  { value: 'PHYS101', label: 'PHYS101 - General Physics I' },
];

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Filter events
  const filteredEvents = mockEvents.filter(event => {
    if (selectedType && event.type !== selectedType) return false;
    if (selectedCourse && event.course !== selectedCourse) return false;
    return true;
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateStr);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quiz':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lab':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'office-hours':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">
            View your schedule and upcoming events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          {user?.role === 'instructor' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Calendar Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <Select
                options={eventTypes}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              />
              <Select
                options={courses}
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2 h-24"></div>;
                  }

                  const date = new Date(year, month, day);
                  const isToday = date.toDateString() === today.toDateString();
                  const events = getEventsForDate(date);

                  return (
                    <div
                      key={day}
                      className={`p-2 h-24 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                        isToday ? 'bg-indigo-50 border-indigo-200' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-indigo-600' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {events.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents
                  .filter(event => new Date(event.date) >= today)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="border-l-4 border-indigo-500 pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAssignmentTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.priority === 'high' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {event.title}
                      </h4>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assignments Due</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quizzes</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lab Sessions</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Office Hours</span>
                  <span className="font-medium">4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};