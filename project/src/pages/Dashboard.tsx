import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Award,
  Calendar,
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  GraduationCap,
  Settings // ✨ Added the Settings icon here
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDate, formatRelativeTime, getGradeColor, getPriorityColor, getAssignmentTypeColor } from '../lib/utils';

// Mock data - replace with actual API calls
const mockDashboardData = {
  student: {
    stats: {
      enrolledCourses: 4,
      pendingAssignments: 3,
      averageGrade: 87.5,
      completedAssignments: 12
    },
    recentGrades: [
      {
        id: '1',
        assignment: 'Python Basics Assignment',
        course: 'CS101',
        grade: 85,
        totalPoints: 100,
        gradedDate: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        assignment: 'Control Structures Quiz',
        course: 'CS101',
        grade: 42,
        totalPoints: 50,
        gradedDate: '2024-01-14T14:30:00Z'
      },
      {
        id: '3',
        assignment: 'Integration Homework',
        course: 'MATH201',
        grade: 72,
        totalPoints: 80,
        gradedDate: '2024-01-13T09:15:00Z'
      }
    ],
    upcomingAssignments: [
      {
        id: '1',
        title: 'Function Design Project',
        course: 'CS101',
        dueDate: '2024-01-20T23:59:00Z',
        type: 'project',
        totalPoints: 150
      },
      {
        id: '2',
        title: 'Linked List Implementation',
        course: 'CS201',
        dueDate: '2024-01-22T23:59:00Z',
        type: 'homework',
        totalPoints: 120
      },
      {
        id: '3',
        title: 'Physics Lab Report',
        course: 'PHYS101',
        dueDate: '2024-01-25T17:00:00Z',
        type: 'lab',
        totalPoints: 100
      }
    ],
    recentAnnouncements: [
      {
        id: '1',
        title: 'CS101 - First Assignment Posted',
        content: 'The first assignment for CS101 has been posted...',
        priority: 'medium',
        publishDate: '2024-01-12T08:00:00Z',
        course: 'CS101'
      },
      {
        id: '2',
        title: 'Library Extended Hours During Finals',
        content: 'The university library will be extending its hours...',
        priority: 'low',
        publishDate: '2024-01-11T15:30:00Z',
        course: null
      }
    ]
  },
  instructor: {
    stats: {
      totalCourses: 3,
      totalStudents: 75,
      pendingGrades: 8,
      averageClassGrade: 82.3
    },
    recentActivity: [
      {
        id: '1',
        type: 'submission',
        message: 'New submission from John Smith for Python Basics Assignment',
        timestamp: '2024-01-15T14:30:00Z',
        course: 'CS101'
      },
      {
        id: '2',
        type: 'grade',
        message: 'Graded 5 assignments for CS201',
        timestamp: '2024-01-15T11:00:00Z',
        course: 'CS201'
      }
    ],
    upcomingDeadlines: [
      {
        id: '1',
        title: 'Grade Function Design Projects',
        dueDate: '2024-01-22T23:59:00Z',
        course: 'CS101',
        type: 'grading'
      },
      {
        id: '2',
        title: 'Midterm Exam Preparation',
        dueDate: '2024-01-25T14:00:00Z',
        course: 'CS201',
        type: 'exam'
      }
    ]
  },
  admin: {
    stats: {
      totalUsers: 1250,
      totalCourses: 45,
      activeStudents: 980,
      systemHealth: 98.5
    },
    systemAlerts: [
      {
        id: '1',
        type: 'warning',
        message: 'Database backup completed successfully',
        timestamp: '2024-01-15T02:00:00Z'
      },
      {
        id: '2',
        type: 'info',
        message: 'New user registrations: 15 today',
        timestamp: '2024-01-15T12:00:00Z'
      }
    ]
  }
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Simulate API call
    const loadDashboardData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user?.role) {
        setDashboardData(mockDashboardData[user.role]);
      }
      setIsLoading(false);
    };

    loadDashboardData();
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-indigo-100">
          You have {dashboardData.stats.pendingAssignments} pending assignments and your current GPA is {dashboardData.stats.averageGrade.toFixed(2)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.enrolledCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingAssignments}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageGrade}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.completedAssignments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                Upcoming Assignments
              </CardTitle>
              <Link to="/assignments">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAssignmentTypeColor(assignment.type)}`}>
                        {assignment.type}
                      </span>
                      <span className="text-sm text-gray-500">{assignment.course}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mt-1">{assignment.title}</h4>
                    <p className="text-sm text-gray-500">
                      Due {formatRelativeTime(assignment.dueDate)} • {assignment.totalPoints} points
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-500" />
                Recent Grades
              </CardTitle>
              <Link to="/grades">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentGrades.map((grade: any) => (
                <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{grade.assignment}</h4>
                    <p className="text-sm text-gray-500">{grade.course} • {formatRelativeTime(grade.gradedDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getGradeColor(grade.grade, grade.totalPoints)}`}>
                      {grade.grade}/{grade.totalPoints}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round((grade.grade / grade.totalPoints) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-500" />
              Recent Announcements
            </CardTitle>
            <Link to="/announcements">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentAnnouncements.map((announcement: any) => (
              <div key={announcement.id} className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {announcement.course && `${announcement.course} • `}
                  {formatRelativeTime(announcement.publishDate)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInstructorDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Good morning, Professor {user?.lastName}! 👨‍🏫
        </h1>
        <p className="text-green-100">
          You have {dashboardData.stats.pendingGrades} assignments to grade across {dashboardData.stats.totalCourses} courses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Grades</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingGrades}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageClassGrade}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {activity.type === 'submission' ? (
                      <FileText className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Award className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.course} • {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingDeadlines.map((deadline: any) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                    <p className="text-sm text-gray-500">
                      {deadline.course} • Due {formatRelativeTime(deadline.dueDate)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAssignmentTypeColor(deadline.type)}`}>
                    {deadline.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/instructor/assignments/new">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </Link>
            <Link to="/instructor/gradebook">
              <Button className="w-full" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Grade Book
              </Button>
            </Link>
            <Link to="/instructor/announcements/new">
              <Button className="w-full" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          System Overview 🔧
        </h1>
        <p className="text-purple-100">
          System health: {dashboardData.stats.systemHealth}% • {dashboardData.stats.activeStudents} active students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.systemHealth}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.systemAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                  <AlertCircle className={`h-4 w-4 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/admin/users">
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/courses">
              <Button className="w-full" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Courses
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button className="w-full" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {user?.role === 'student' && renderStudentDashboard()}
      {user?.role === 'instructor' && renderInstructorDashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
    </div>
  );
};
