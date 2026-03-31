import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const isLandingPage = location.pathname === '/';

    return (
        <nav
            className={`navbar navbar-expand-lg fixed-top ${isLandingPage ? 'border-0 shadow-none' : 'border-bottom shadow-sm'}`}
            style={{
                zIndex: 1000,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                height: 'auto',
                background: isLandingPage ? 'transparent' : 'var(--navbar-bg)',
                paddingTop: isLandingPage ? '1.5rem' : '0.5rem',
                backdropFilter: isLandingPage ? 'none' : 'saturate(180%) blur(50px)',
                WebkitBackdropFilter: isLandingPage ? 'none' : 'saturate(180%) blur(50px)'
            }}
        >
            <div className={`container ${isLandingPage ? 'navbar-glass-pill py-2 shadow-lg' : ''}`} style={{ maxWidth: isLandingPage ? '880px' : '100%' }}>
                {/* Logo Section */}
                <Link 
                    to="/" 
                    className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
                    style={{ transition: 'transform 0.3s ease' }}
                >
                    <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                                d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16" 
                                stroke={isLandingPage ? "#ffffff" : "var(--primary-color)"} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                            />
                            <path 
                                d="M12 16L16 20L26 8" 
                                stroke={isLandingPage ? "#ffffff" : "var(--primary-color)"} 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </svg>
                    </div>
                    <span 
                        className="fw-bold fs-5 tracking-tighter"
                        style={{ color: isLandingPage ? '#ffffff' : 'var(--text-primary)' }}
                    >
                        CleanStreet
                    </span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler border-0 shadow-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#publicNavbar"
                    aria-controls="publicNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    style={{ filter: isLandingPage ? 'invert(1)' : 'none' }}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Links Section */}
                <div className="collapse navbar-collapse" id="publicNavbar">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-center gap-1">
                        <li className="nav-item">
                            <Link to="/" className={isLandingPage ? 'nav-link nav-link-premium text-white opacity-75' : 'nav-link'}>Home</Link>
                        </li>
                        <li className="nav-item">
                            {isLandingPage ? (
                                <a href="#stats" className="nav-link nav-link-premium text-white opacity-75">Community</a>
                            ) : (
                                <Link to="/" className="nav-link">Community</Link>
                            )}
                        </li>
                        <li className="nav-item">
                            {isLandingPage ? (
                                <a href="#how-it-works" className="nav-link nav-link-premium text-white opacity-75">About</a>
                            ) : (
                                <Link to="/" className="nav-link">About</Link>
                            )}
                        </li>
                    </ul>

                    {/* Auth Buttons */}
                    <div className="d-flex align-items-center gap-3">
                        {localStorage.getItem('isAuthenticated') === 'true' ? (
                            <Link
                                to={
                                    localStorage.getItem('userRole') === 'admin' ? '/admin' : 
                                    localStorage.getItem('userRole') === 'volunteer' ? '/volunteer' : '/dashboard'
                                }
                                className="btn btn-primary px-4 py-2 rounded-pill fw-bold small text-uppercase tracking-wider border-0 shadow-sm"
                                style={{
                                    background: isLandingPage ? '#0071e3' : 'var(--primary-color)',
                                    boxShadow: '0 8px 24px rgba(0, 113, 227, 0.4)',
                                    border: 'none',
                                    fontSize: '0.75rem',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-decoration-none fw-bold small text-uppercase tracking-wider"
                                    style={{
                                        color: isLandingPage ? 'rgba(255,255,255,0.9)' : (isLogin ? 'var(--primary-color)' : 'var(--text-primary)'),
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn btn-primary px-4 py-2 rounded-pill fw-bold small text-uppercase tracking-wider border-0 shadow-sm"
                                    style={{
                                        background: isLandingPage ? '#0071e3' : 'var(--primary-color)',
                                        boxShadow: '0 8px 24px rgba(0, 113, 227, 0.4)',
                                        border: 'none',
                                        fontSize: '0.75rem',
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
