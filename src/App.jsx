import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import './App.css'

function AppContent() {
    const navigate = useNavigate()
    const location = useLocation()

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

    return (
        <>
            <Navbar showLogin={showLogin} showSignup={showSignup} />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Login showSignup={showSignup} />} />
                    <Route path="/signup" element={<Signup showLogin={showLogin} />} />
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
