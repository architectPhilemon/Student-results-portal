import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { RegisterData } from '../types';

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

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
];

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    defaultValues: {
      role: 'student',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join EduPortal and start your learning journey
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <Input
                label="First Name"
                type="text"
                leftIcon={<User className="h-4 w-4" />}
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
                type="text"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters',
                  },
                })}
              />

              <Input
                label="Email Address"
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                />
              </div>

              <Input
                label="Phone Number (Optional)"
                type="tel"
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
                {...register('phone', {
                  pattern: {
                    value: /^\+?[\d\s-()]+$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
              />
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
              
              <Select
                label="Role"
                options={roles}
                error={errors.role?.message}
                {...register('role', {
                  required: 'Role is required',
                })}
              />

              <Select
                label="Department"
                options={departments}
                error={errors.department?.message}
                {...register('department', {
                  required: 'Department is required',
                })}
              />

              {selectedRole === 'student' && (
                <Select
                  label="Academic Year"
                  options={years}
                  error={errors.year?.message}
                  {...register('year', {
                    required: selectedRole === 'student' ? 'Academic year is required' : false,
                  })}
                />
              )}

              <Input
                label="Date of Birth (Optional)"
                type="date"
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
              />

              {/* Address Fields */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address (Optional)
                </label>
                
                <Input
                  placeholder="Street Address"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  {...register('address.street')}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    {...register('address.city')}
                  />
                  <Input
                    placeholder="State"
                    {...register('address.state')}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="ZIP Code"
                    {...register('address.zipCode')}
                  />
                  <Input
                    placeholder="Country"
                    defaultValue="USA"
                    {...register('address.country')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};