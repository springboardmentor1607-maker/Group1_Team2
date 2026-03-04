import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

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
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate 
                                to={getDashboardRoute()} 
                                replace 
                            />
                        ) : (
                            <AuthLayout subtitle="Welcome Back, Citizen!">
                                <Login onLogin={handleLogin} />
                            </AuthLayout>
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
                            <AuthLayout subtitle="Join Your Community Today">
                                <Signup onLogin={handleLogin} />
                            </AuthLayout>
                        )
                    }
                />

                {/* Redirect Root to Login or Dashboard */}
                <Route
                    path="/"
                    element={
                        <Navigate 
                            to={isAuthenticated ? getDashboardRoute() : '/login'} 
                            replace 
                        />
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
                                    <Route path="/admin" element={<AdminDashboard />} />
                                    {/* Catch all inside dashboard to redirect based on role */}
                                    <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
                                </Routes>
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;