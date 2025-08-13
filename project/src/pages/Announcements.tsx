import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Pin,
  MessageSquare,
  Calendar,
  User,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDate, formatRelativeTime, getPriorityColor } from '../lib/utils';

// Mock announcements data
const mockAnnouncements = [
  {
    _id: '1',
    title: 'Welcome to Fall 2024 Semester!',
    content: 'Welcome back students! We\'re excited to start another great semester. Please make sure to check your course schedules and required materials. The bookstore is offering a 10% discount on textbooks through the end of this week.',
    author: {
      _id: 'admin1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'admin'
    },
    course: null,
    type: 'general',
    priority: 'high',
    targetAudience: 'all',
    isPublished: true,
    publishDate: '2024-01-15T08:00:00Z',
    isPinned: true,
    allowComments: true,
    comments: [
      {
        author: {
          _id: 'student1',
          firstName: 'John',
          lastName: 'Smith',
          role: 'student'
        },
        content: 'Thanks for the welcome message! Looking forward to the semester.',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ],
    readBy: [
      {
        user: 'student1',
        readAt: '2024-01-15T09:15:00Z'
      }
    ],
    tags: ['welcome', 'semester', 'bookstore']
  },
  {
    _id: '2',
    title: 'CS101 - First Assignment Posted',
    content: 'The first assignment for CS101 has been posted. It covers Python basics including variables and data types. Please review the requirements carefully and don\'t hesitate to ask questions during office hours. Due date is February 20th at 11:59 PM.',
    author: {
      _id: 'inst1',
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      role: 'instructor'
    },
    course: {
      _id: 'course1',
      courseCode: 'CS101',
      title: 'Introduction to Computer Science'
    },
    type: 'assignment',
    priority: 'medium',
    targetAudience: 'specific_course',
    isPublished: true,
    publishDate: '2024-02-01T14:30:00Z',
    isPinned: false,
    allowComments: true,
    comments: [
      {
        author: {
          _id: 'student2',
          firstName: 'Emma',
          lastName: 'Williams',
          role: 'student'
        },
        content: 'Can we use any Python IDE or do you recommend a specific one?',
        timestamp: '2024-02-01T16:45:00Z'
      },
      {
        author: {
          _id: 'inst1',
          firstName: 'Dr. Michael',
          lastName: 'Johnson',
          role: 'instructor'
        },
        content: 'You can use any IDE you prefer. VS Code, PyCharm, or even IDLE are all fine choices.',
        timestamp: '2024-02-01T17:15:00Z'
      }
    ],
    readBy: [],
    tags: ['assignment', 'python', 'cs101']
  },
  {
    _id: '3',
    title: 'Library Extended Hours During Finals',
    content: 'The university library will be extending its hours during finals week. We will be open 24/7 from December 10-17. Additional study spaces and computer labs will also be available. Please bring your student ID for after-hours access.',
    author: {
      _id: 'admin1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'admin'
    },
    course: null,
    type: 'general',
    priority: 'medium',
    targetAudience: 'students',
    isPublished: true,
    publishDate: '2024-01-20T12:00:00Z',
    expiryDate: '2024-12-20T00:00:00Z',
    isPinned: false,
    allowComments: true,
    comments: [],
    readBy: [],
    tags: ['library', 'finals', 'study-spaces']
  },
  {
    _id: '4',
    title: 'System Maintenance - February 25th',
    content: 'The campus network will undergo scheduled maintenance this Saturday from 2:00 AM to 6:00 AM. During this time, internet access may be intermittent. Please plan accordingly for any online assignments or activities.',
    author: {
      _id: 'admin1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'admin'
    },
    course: null,
    type: 'schedule',
    priority: 'urgent',
    targetAudience: 'all',
    isPublished: true,
    publishDate: '2024-02-20T16:00:00Z',
    expiryDate: '2024-02-26T00:00:00Z',
    isPinned: true,
    allowComments: false,
    comments: [],
    readBy: [],
    tags: ['network', 'maintenance', 'internet']
  }
];

const typeFilters = [
  { value: '', label: 'All Types' },
  { value: 'general', label: 'General' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'reminder', label: 'Reminder' },
];

const priorityFilters = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState(mockAnnouncements);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  useEffect(() => {
    filterAnnouncements();
  }, [searchQuery, selectedType, selectedPriority, announcements]);

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(announcement => announcement.type === selectedType);
    }

    // Priority filter
    if (selectedPriority) {
      filtered = filtered.filter(announcement => announcement.priority === selectedPriority);
    }

    // Sort by pinned first, then by priority and date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

    setFilteredAnnouncements(filtered);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const isRead = (announcement: any) => {
    return announcement.readBy.some((read: any) => read.user === user?._id);
  };

  const markAsRead = async (announcementId: string) => {
    // Simulate API call
    setAnnouncements(prev => prev.map(ann => 
      ann._id === announcementId 
        ? {
            ...ann,
            readBy: [...ann.readBy, { user: user?._id, readAt: new Date().toISOString() }]
          }
        : ann
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">
            {user?.role === 'student' ? 'Stay updated with important information' : 'Manage course announcements'}
          </p>
        </div>
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <Link to="/announcements/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search announcements..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={typeFilters}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            />
            <Select
              options={priorityFilters}
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => {
          const read = isRead(announcement);
          
          return (
            <Card 
              key={announcement._id} 
              className={`hover:shadow-lg transition-shadow ${!read ? 'border-l-4 border-l-indigo-500' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Announcement Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-indigo-600" />
                      )}
                      <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {getPriorityIcon(announcement.priority)}
                        <span className="capitalize">{announcement.priority}</span>
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                        {announcement.type}
                      </span>
                      {announcement.course && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {announcement.course.courseCode}
                        </span>
                      )}
                      {!read && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          New
                        </span>
                      )}
                    </div>

                    {/* Title and Content */}
                    <h3 className={`text-lg font-semibold mb-2 ${!read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {announcement.content}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>
                          {announcement.author.firstName} {announcement.author.lastName}
                          <span className="ml-1 capitalize">({announcement.author.role})</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatRelativeTime(announcement.publishDate)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {announcement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {announcement.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comments Preview */}
                    {announcement.allowComments && announcement.comments.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {announcement.comments.length} comment{announcement.comments.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>{announcement.comments[0].author.firstName}:</strong> {announcement.comments[0].content}
                          {announcement.comments.length > 1 && (
                            <span className="text-gray-500 ml-2">
                              and {announcement.comments.length - 1} more...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expiry Warning */}
                    {announcement.expiryDate && new Date(announcement.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Expires on {formatDate(announcement.expiryDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => !read && markAsRead(announcement._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {read ? 'Read' : 'Mark Read'}
                    </Button>
                    
                    {announcement.allowComments && (
                      <Link to={`/announcements/${announcement._id}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comment
                        </Button>
                      </Link>
                    )}
                    
                    {(user?.role === 'instructor' || user?.role === 'admin') && 
                     announcement.author._id === user?._id && (
                      <>
                        <Link to={`/announcements/${announcement._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="danger" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
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
      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedType('');
              setSelectedPriority('');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};