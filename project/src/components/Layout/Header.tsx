import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn, generateInitials } from '../../lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>

        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block">
            EduPortal
          </span>
        </Link>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-lg mx-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses, assignments, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user ? generateInitials(user.firstName, user.lastName) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'Student'}
              </p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};