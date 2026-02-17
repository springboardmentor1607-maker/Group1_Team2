import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const PublicNavbar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <nav
            className="navbar navbar-expand-lg fixed-top border-bottom shadow-sm"
            style={{
                height: '70px',
                zIndex: 1000,
                backgroundColor: 'var(--navbar-bg)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <div className="container-fluid px-4">
                {/* Logo Section */}
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
                    <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#22C55E" />
                                    <stop offset="100%" stopColor="#14B8A6" />
                                </linearGradient>
                            </defs>
                            <rect width="32" height="32" rx="6" fill="url(#navLogoGradient)" />
                            <path d="M6 18V26H10V18H6ZM11 15V26H15V15H11ZM16 17V26H20V17H16ZM21 19V26H25V19H21Z" fill="white" />
                            {/* Simple icon shape */}
                        </svg>
                    </div>
                    <span className="fw-bold fs-5 text-body">CleanStreet</span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#publicNavbar"
                    aria-controls="publicNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Links Section */}
                <div className="collapse navbar-collapse" id="publicNavbar">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-center">
                        <li className="nav-item">
                            <span className="nav-link text-muted fw-medium px-4 cursor-pointer">Dashboard</span>
                        </li>
                        <li className="nav-item">
                            <span className="nav-link text-muted fw-medium px-4 cursor-pointer">Report Issue</span>
                        </li>
                        <li className="nav-item">
                            <span className="nav-link text-muted fw-medium px-4 cursor-pointer">View Complaints</span>
                        </li>
                    </ul>

                    {/* Auth Buttons */}
                    <div className="d-flex align-items-center gap-3">
                        <Link
                            to="/login"
                            className="text-decoration-none fw-semibold"
                            style={{
                                color: isLogin ? '#22C55E' : 'var(--text-primary)'
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="btn btn-primary px-4 py-2 rounded-2 fw-semibold border-0"
                            style={{
                                background: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Register
                        </Link>
                        <button onClick={toggleTheme} className="btn text-body ms-2 p-2">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
