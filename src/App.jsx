import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from './components/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './components/Login';
import Signup from './components/Signup';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import MapView from './pages/MapView';
import Settings from './pages/Settings';
import ReportIssue from './pages/ReportIssue';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Notifications from './pages/Notifications';
import LandingPage from './pages/LandingPage';
import { ToastProvider } from './context/ToastContext';

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function AppContent({ isAuthenticated, handleLogin, handleLogout, getDashboardRoute }) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={<LandingPage />}
                />
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate 
                                to={getDashboardRoute()} 
                                replace 
                            />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                <Route
                    path="/signup"
                    element={
                        isAuthenticated ? (
                            <Navigate 
                                to={getDashboardRoute()} 
                                replace 
                            />
                        ) : (
                            <Signup onLogin={handleLogin} />
                        )
                    }
                />


                {/* Protected Dashboard Routes */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <DashboardLayout onLogout={handleLogout}>
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/volunteer" element={<VolunteerDashboard />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/complaints" element={<Complaints />} />
                                    <Route path="/map" element={<MapView />} />
                                    <Route path="/report-issue" element={<ReportIssue />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/admin" element={<AdminDashboard />} />
                                    {/* Catch all inside dashboard to redirect based on role */}
                                    <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
                                </Routes>
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    // Initialize auth state from localStorage to persist login across refreshes
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const auth = localStorage.getItem('isAuthenticated') === 'true';
        const hasToken = !!localStorage.getItem('token');
        return auth && hasToken;
    });

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
    };

    const getDashboardRoute = () => {
        const role = localStorage.getItem('userRole');
        if (role === 'admin') return '/admin';
        if (role === 'volunteer') return '/volunteer';
        return '/dashboard';
    };

    return (
        <Router>
            <ToastProvider>
                <AppContent 
                    isAuthenticated={isAuthenticated} 
                    handleLogin={handleLogin} 
                    handleLogout={handleLogout} 
                    getDashboardRoute={getDashboardRoute} 
                />
            </ToastProvider>
        </Router>
    );
}

export default App;