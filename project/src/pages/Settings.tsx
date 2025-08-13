import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import toast from 'react-hot-toast';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
];

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // General settings form
  const {
    register: registerGeneral,
    handleSubmit: handleSubmitGeneral,
    formState: { errors: errorsGeneral, isDirty: isDirtyGeneral },
  } = useForm({
    defaultValues: {
      language: 'en',
      timezone: 'America/New_York',
      theme: 'light',
    },
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: {
      announcements: true,
      assignments: true,
      grades: true,
      messages: true,
      reminders: true,
    },
    push: {
      announcements: true,
      assignments: true,
      grades: false,
      messages: true,
      reminders: true,
    },
    sms: {
      announcements: false,
      assignments: true,
      grades: false,
      messages: false,
      reminders: true,
    },
  });

  // Security settings form
  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    reset: resetSecurity,
    formState: { errors: errorsSecurity },
  } = useForm();

  const onSubmitGeneral = async (data: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('General settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSecurity = async (data: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetSecurity();
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotifications = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left hover:bg-gray-50 ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitGeneral(onSubmitGeneral)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Language"
                      options={languages}
                      leftIcon={<Globe className="h-4 w-4" />}
                      {...registerGeneral('language')}
                    />
                    <Select
                      label="Timezone"
                      options={timezones}
                      {...registerGeneral('timezone')}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!isDirtyGeneral || isLoading}
                      isLoading={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Mail className="h-5 w-5 mr-2 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(notifications.email).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setNotifications(prev => ({
                                  ...prev,
                                  email: { ...prev.email, [key]: e.target.checked }
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Smartphone className="h-5 w-5 mr-2 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(notifications.push).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setNotifications(prev => ({
                                  ...prev,
                                  push: { ...prev.push, [key]: e.target.checked }
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <div className="flex items-center mb-4">
                      <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(notifications.sms).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setNotifications(prev => ({
                                  ...prev,
                                  sms: { ...prev.sms, [key]: e.target.checked }
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={updateNotifications} isLoading={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSecurity(onSubmitSecurity)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                    
                    <Input
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                      error={errorsSecurity.currentPassword?.message}
                      {...registerSecurity('currentPassword', {
                        required: 'Current password is required',
                      })}
                    />

                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                      error={errorsSecurity.newPassword?.message}
                      {...registerSecurity('newPassword', {
                        required: 'New password is required',
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

                    <Input
                      label="Confirm New Password"
                      type="password"
                      error={errorsSecurity.confirmPassword?.message}
                      {...registerSecurity('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (value, { newPassword }) =>
                          value === newPassword || 'Passwords do not match',
                      })}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Login Notifications</p>
                          <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {themes.map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <div
                            key={theme.value}
                            className="relative border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">{theme.label}</span>
                            </div>
                            <input
                              type="radio"
                              name="theme"
                              value={theme.value}
                              defaultChecked={theme.value === 'light'}
                              className="absolute top-4 right-4"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Appearance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};