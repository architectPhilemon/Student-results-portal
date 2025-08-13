import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  Award,
  Bell,
  Upload,
  UserCheck,
  BookMarked,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Courses', href: '/courses', icon: BookOpen },
      { name: 'Assignments', href: '/assignments', icon: FileText },
      { name: 'Grades', href: '/grades', icon: BarChart3 },
      { name: 'Announcements', href: '/announcements', icon: Bell },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
      { name: 'Messages', href: '/messages', icon: MessageSquare },
    ];

    if (user?.role === 'student') {
      return [
        ...commonItems,
        { name: 'My Progress', href: '/progress', icon: TrendingUp },
        { name: 'Study Groups', href: '/study-groups', icon: Users },
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...commonItems,
        { name: 'My Courses', href: '/instructor/courses', icon: BookMarked },
        { name: 'Grade Book', href: '/instructor/gradebook', icon: ClipboardList },
        { name: 'Students', href: '/instructor/students', icon: UserCheck },
        { name: 'Analytics', href: '/instructor/analytics', icon: TrendingUp },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Course Management', href: '/admin/courses', icon: BookMarked },
        { name: 'System Analytics', href: '/admin/analytics', icon: TrendingUp },
        { name: 'Reports', href: '/admin/reports', icon: ClipboardList },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">EduPortal</h2>
                <p className="text-sm text-gray-500 capitalize">{user?.role || 'Student'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 mr-3',
                      isActive ? 'text-indigo-700' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};