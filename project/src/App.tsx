import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Assignments } from './pages/Assignments';
import { Grades } from './pages/Grades';
import { Announcements } from './pages/Announcements';
import { Calendar } from './pages/Calendar';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AssignmentTaker } from './pages/AssignmentTaker';
import { QuizBuilder } from './pages/QuizBuilder';
import { SubmissionsList } from './pages/SubmissionsList';
import { SubmissionGrader } from './pages/SubmissionGrader';
import CreateAssignment from './pages/CreateAssignment'; // <-- FIXED: This is now a default import
import { LoadingSpinner } from './components/UI/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <Assignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments/:id/take"
                element={
                  <ProtectedRoute>
                    <AssignmentTaker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/assignments/new"
                element={
                  <ProtectedRoute>
                    <CreateAssignment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/quiz-builder"
                element={
                  <ProtectedRoute>
                    <QuizBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/assignments/:assignmentId/submissions"
                element={
                  <ProtectedRoute>
                    <SubmissionsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/assignments/:assignmentId/submissions/:studentId/grade"
                element={
                  <ProtectedRoute>
                    <SubmissionGrader />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades"
                element={
                  <ProtectedRoute>
                    <Grades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <Announcements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
