import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import './App.css'

function AppContent() {
    const navigate = useNavigate()
    const location = useLocation()
    
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true'
    })

    // Theme state management
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('bs-theme') || 'light'
    })

    // Apply theme to document root with Bootstrap's data-bs-theme attribute
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme)
        localStorage.setItem('bs-theme', theme)
    }, [theme])

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)
    }

    const handleLogin = () => {
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        navigate('/dashboard')
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem('isAuthenticated')
        navigate('/')
    }

    const showLogin = () => {
        navigate('/')
    }

    const showSignup = () => {
        navigate('/signup')
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'l' && !e.target.matches('input, textarea')) {
                showLogin()
            }
            if (e.key === 'r' && !e.target.matches('input, textarea')) {
                showSignup()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Protected route wrapper
    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/" replace />
    }

    // Public route wrapper (redirect to dashboard if already logged in)
    const PublicRoute = ({ children }) => {
        return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
    }

    return (
        <>
            {/* Show navbar for auth pages, dashboard layout handles its own navbar */}
            {!isAuthenticated && (
                <Navbar
                    showLogin={showLogin}
                    showSignup={showSignup}
                    currentTheme={theme}
                    onThemeChange={handleThemeChange}
                />
            )}
            
            <div className="main-content">
                <Routes>
                    {/* Public routes */}
                    <Route 
                        path="/" 
                        element={
                            <PublicRoute>
                                <Login showSignup={showSignup} onLogin={handleLogin} />
                            </PublicRoute>
                        } 
                    />
                    <Route 
                        path="/signup" 
                        element={
                            <PublicRoute>
                                <Signup showLogin={showLogin} onLogin={handleLogin} />
                            </PublicRoute>
                        } 
                    />
                    
                    {/* Protected routes */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <DashboardLayout 
                                    onLogout={handleLogout}
                                    currentTheme={theme}
                                    onThemeChange={handleThemeChange}
                                >
                                    <Dashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            <ProtectedRoute>
                                <DashboardLayout 
                                    onLogout={handleLogout}
                                    currentTheme={theme}
                                    onThemeChange={handleThemeChange}
                                >
                                    <Profile />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Default redirect */}
                    <Route 
                        path="*" 
                        element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
                    />
                </Routes>
            </div>
        </>
    )
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}

export default App
