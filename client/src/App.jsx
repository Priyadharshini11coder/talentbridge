import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AttendancePage from './pages/student/AttendancePage';
import TasksPage from './pages/student/TasksPage';
import DailyReportsPage from './pages/student/DailyReportsPage';
import PerformancePage from './pages/student/PerformancePage';
import ProfilePage from './pages/student/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InternManagement from './pages/admin/InternManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import TaskManagement from './pages/admin/TaskManagement';
import ReportManagement from './pages/admin/ReportManagement';
import PerformanceManagement from './pages/admin/PerformanceManagement';

// Dynamic role-aware redirect helper for top-level shortcuts like /dashboard, /attendance, etc.
function DashboardRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Quick Route Aliases */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/attendance" element={<Navigate to="/student/attendance" replace />} />
          <Route path="/tasks" element={<Navigate to="/student/tasks" replace />} />
          <Route path="/reports" element={<Navigate to="/student/reports" replace />} />
          <Route path="/performance" element={<Navigate to="/student/performance" replace />} />
          <Route path="/profile" element={<Navigate to="/student/profile" replace />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<AttendancePage />} />
            <Route path="/student/tasks" element={<TasksPage />} />
            <Route path="/student/reports" element={<DailyReportsPage />} />
            <Route path="/student/performance" element={<PerformancePage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/interns" element={<InternManagement />} />
            <Route path="/admin/attendance" element={<AttendanceManagement />} />
            <Route path="/admin/tasks" element={<TaskManagement />} />
            <Route path="/admin/reports" element={<ReportManagement />} />
            <Route path="/admin/performance" element={<PerformanceManagement />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
