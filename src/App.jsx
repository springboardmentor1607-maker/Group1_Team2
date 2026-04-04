import React, { useState, useEffect } from 'react'; // Root Integrity Fix
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
import CompleteProfile from './pages/CompleteProfile';
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
                            <Login onLogin={handleLogin} getDashboardRoute={getDashboardRoute} />
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
                            <Signup onLogin={handleLogin} getDashboardRoute={getDashboardRoute} />
                        )
                    }
                />
                <Route
                    path="/complete-profile"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CompleteProfile />
                        </ProtectedRoute>
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
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (err) {
            console.error('Error parsing user from localStorage:', err);
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const auth = localStorage.getItem('isAuthenticated') === 'true';
        const hasToken = !!localStorage.getItem('token');
        return auth && hasToken && !!user;
    });

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
    };

    const getDashboardRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'volunteer': return '/volunteer';
            default: return '/dashboard';
        }
    };

    return (
        <ToastProvider>
            <Router>
                <AppContent 
                    isAuthenticated={isAuthenticated} 
                    handleLogin={handleLogin} 
                    handleLogout={handleLogout} 
                    getDashboardRoute={getDashboardRoute} 
                />
            </Router>
        </ToastProvider>
    );
}

export default App;