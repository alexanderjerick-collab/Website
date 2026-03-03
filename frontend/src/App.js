import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Grades from './pages/Grades';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Users from './pages/Users';
import ActivityLogs from './pages/ActivityLogs';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout><Tasks /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/grades" element={
              <ProtectedRoute>
                <Layout><Grades /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <Layout><Events /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <Layout><Users /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute roles={['admin']}>
                <Layout><ActivityLogs /></Layout>
              </ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
