import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Award,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Textarea, Select } from '../components/UI/Input';
import { formatDate, formatGPA } from '../lib/utils';
import toast from 'react-hot-toast';

const departments = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'English', label: 'English' },
  { value: 'History', label: 'History' },
  { value: 'Business', label: 'Business' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Psychology', label: 'Psychology' },
];

const years = [
  { value: 'Freshman', label: 'Freshman' },
  { value: 'Sophomore', label: 'Sophomore' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Graduate', label: 'Graduate' },
];

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'USA',
      },
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  // Mock academic data
  const academicStats = {
    currentGPA: 3.7,
    totalCredits: 45,
    completedCourses: 12,
    currentCourses: 4,
    academicStanding: 'Good Standing',
    expectedGraduation: 'Spring 2025'
  };

  const recentActivity = [
    {
      type: 'grade',
      description: 'Received grade for Python Assignment',
      course: 'CS101',
      date: '2024-02-20T10:00:00Z',
      grade: 'B+'
    },
    {
      type: 'submission',
      description: 'Submitted Data Structures Quiz',
      course: 'CS201',
      date: '2024-02-19T14:30:00Z'
    },
    {
      type: 'enrollment',
      description: 'Enrolled in Database Systems',
      course: 'CS301',
      date: '2024-02-15T09:00:00Z'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || isLoading}
              isLoading={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    leftIcon={<User className="h-4 w-4" />}
                    disabled={!isEditing}
                    error={errors.firstName?.message}
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                  />
                  <Input
                    label="Last Name"
                    leftIcon={<User className="h-4 w-4" />}
                    disabled={!isEditing}
                    error={errors.lastName?.message}
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  disabled={true} // Email should not be editable
                  {...register('email')}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  leftIcon={<Phone className="h-4 w-4" />}
                  disabled={!isEditing}
                  error={errors.phone?.message}
                  {...register('phone', {
                    pattern: {
                      value: /^\+?[\d\s-()]+$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  leftIcon={<Calendar className="h-4 w-4" />}
                  disabled={!isEditing}
                  {...register('dateOfBirth')}
                />
              </form>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Street Address"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  disabled={!isEditing}
                  {...register('address.street')}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    disabled={!isEditing}
                    {...register('address.city')}
                  />
                  <Input
                    label="State"
                    disabled={!isEditing}
                    {...register('address.state')}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    disabled={!isEditing}
                    {...register('address.zipCode')}
                  />
                  <Input
                    label="Country"
                    disabled={!isEditing}
                    {...register('address.country')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardContent className="text-center p-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : 'User Name'}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <p className="text-sm text-gray-500">{user?.department}</p>
              {user?.role === 'student' && (
                <>
                  <p className="text-sm text-gray-500">{user?.year}</p>
                  <p className="text-sm text-gray-500">ID: {user?.studentId}</p>
                </>
              )}
              {user?.role === 'instructor' && (
                <p className="text-sm text-gray-500">ID: {user?.employeeId}</p>
              )}
            </CardContent>
          </Card>

          {/* Academic Stats (for students) */}
          {user?.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Academic Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current GPA</span>
                    <span className="font-semibold text-indigo-600">
                      {formatGPA(academicStats.currentGPA)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Credits</span>
                    <span className="font-semibold">{academicStats.totalCredits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Courses</span>
                    <span className="font-semibold">{academicStats.completedCourses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Courses</span>
                    <span className="font-semibold">{academicStats.currentCourses}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Academic Standing</span>
                      <span className="text-sm font-semibold text-green-600">
                        {academicStats.academicStanding}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expected Graduation</span>
                      <span className="text-sm font-semibold">
                        {academicStats.expectedGraduation}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1 bg-indigo-100 rounded-full">
                      {activity.type === 'grade' && <Award className="h-3 w-3 text-indigo-600" />}
                      {activity.type === 'submission' && <BookOpen className="h-3 w-3 text-indigo-600" />}
                      {activity.type === 'enrollment' && <TrendingUp className="h-3 w-3 text-indigo-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.course}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.date)}
                        </span>
                        {activity.grade && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-medium text-green-600">
                              {activity.grade}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};