import React, { useState } from 'react'
import ThemeToggle from './ThemeToggle'

function Navbar({ showLogin, showSignup, currentTheme, onThemeChange }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="navbar navbar-expand-md glass-card position-sticky top-0 border-bottom border-white border-opacity-10 backdrop-blur" style={{ zIndex: 1050 }}>
            <div className="container-xxl px-3 px-sm-4 px-lg-5">
                <div className="d-flex justify-content-between align-items-center w-100" style={{ height: '64px' }}>
                    {/* Logo and Brand */}
                    <div className="d-flex align-items-center min-w-0 flex-shrink-1">
                        <div className="d-flex align-items-center">
                            <div className="position-relative">
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    className="me-2 me-sm-3 transition-transform">
                                    <defs>
                                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#14B8A6', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <rect width="32" height="32" rx="6" fill="url(#logoGradient)" />
                                    <rect x="6" y="18" width="4" height="8" fill="white" opacity="0.9" />
                                    <rect x="11" y="15" width="4" height="11" fill="white" opacity="0.9" />
                                    <rect x="16" y="17" width="4" height="9" fill="white" opacity="0.9" />
                                    <rect x="21" y="19" width="4" height="7" fill="white" opacity="0.9" />
                                    <path d="M8 8 L14 14 L12 16 L6 10 Z" fill="white" />
                                    <rect x="13" y="13" width="2" height="8" rx="1" fill="white" transform="rotate(-45 14 14)" />
                                    <circle cx="20" cy="8" r="1.5" fill="white" />
                                    <circle cx="24" cy="10" r="1" fill="white" />
                                    <circle cx="18" cy="11" r="1" fill="white" />
                                </svg>
                            </div>
                            <span className="fs-5 fs-md-4 fs-lg-3 fw-bold gradient-text text-truncate">
                                CleanStreet
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="d-none d-md-block">
                        <div className="d-flex align-items-baseline gap-3">
                            <a href="#dashboard" className="text-secondary text-decoration-none px-4 py-2 rounded small fw-medium interactive-element">
                                Dashboard
                            </a>
                            <a href="#report" className="text-secondary text-decoration-none px-4 py-2 rounded small fw-medium interactive-element">
                                Report Issue
                            </a>
                            <a href="#complaints" className="text-secondary text-decoration-none px-4 py-2 rounded small fw-medium interactive-element">
                                View Complaints
                            </a>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="d-none d-md-flex align-items-center gap-2 gap-lg-3 ms-2">
                        <ThemeToggle currentTheme={currentTheme} onThemeChange={onThemeChange} />
                        <button 
                            onClick={showLogin}
                            className="btn btn-outline-primary px-3 px-lg-4 py-2 rounded small fw-medium"
                        >
                            Login
                        </button>
                        <button 
                            onClick={showSignup}
                            className="btn btn-primary text-white px-4 px-lg-5 py-2 rounded small fw-medium"
                        >
                            Register
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="d-flex d-md-none align-items-center gap-2">
                        <ThemeToggle currentTheme={currentTheme} onThemeChange={onThemeChange} />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="btn btn-light p-2 rounded"
                            type="button"
                        >
                            <svg className="icon-size"' style={{ width: '24px', height: '24px' }} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {!isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isOpen && (
                    <div className="d-md-none">
                        <div className="px-2 pt-2 pb-3 border-top">
                            <a href="#dashboard" className="text-secondary text-decoration-none d-block px-3 py-2 rounded small fw-medium">
                                Dashboard
                            </a>
                            <a href="#report" className="text-secondary text-decoration-none d-block px-3 py-2 rounded small fw-medium">
                                Report Issue
                            </a>
                            <a href="#complaints" className="text-secondary text-decoration-none d-block px-3 py-2 rounded small fw-medium">
                                View Complaints
                            </a>
                            <div className="pt-4 pb-3 border-top">
                                <div className="d-flex flex-column gap-2">
                                    <button 
                                        onClick={() => { showLogin(); setIsOpen(false); }}
                                        className="btn btn-outline-primary w-100 text-start px-3 py-2 rounded small fw-medium"
                                    >
                                        Login
                                    </button>
                                    <button 
                                        onClick={() => { showSignup(); setIsOpen(false); }}
                                        className="btn btn-primary w-100 text-start px-3 py-2 rounded small fw-medium"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center min-w-0 flex-shrink">
                        <div className="flex-shrink-0 flex items-center group">
                            <div className="relative">
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    className="sm:w-8 sm:h-8 mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <defs>
                                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#14B8A6', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <rect width="32" height="32" rx="6" fill="url(#logoGradient)" className="group-hover:shadow-lg" />
                                    <rect x="6" y="18" width="4" height="8" fill="white" opacity="0.9" />
                                    <rect x="11" y="15" width="4" height="11" fill="white" opacity="0.9" />
                                    <rect x="16" y="17" width="4" height="9" fill="white" opacity="0.9" />
                                    <rect x="21" y="19" width="4" height="7" fill="white" opacity="0.9" />
                                    <path d="M8 8 L14 14 L12 16 L6 10 Z" fill="white" />
                                    <rect x="13" y="13" width="2" height="8" rx="1" fill="white" transform="rotate(-45 14 14)" />
                                    <circle cx="20" cy="8" r="1.5" fill="white" />
                                    <circle cx="24" cy="10" r="1" fill="white" />
                                    <circle cx="18" cy="11" r="1" fill="white" />
                                </svg>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500 to-accent-1 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                            </div>
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text group-hover:text-shimmer transition-all duration-300 truncate">
                                CleanStreet
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="#dashboard" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 interactive-element">
                                Dashboard
                            </a>
                            <a href="#report" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 interactive-element">
                                Report Issue
                            </a>
                            <a href="#complaints" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 interactive-element">
                                View Complaints
                            </a>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-3 ml-2">
                        <ThemeToggle currentTheme={currentTheme} onThemeChange={onThemeChange} />
                        <button 
                            onClick={showLogin}
                            className="bg-transparent border-2 border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 interactive-element"
                        >
                            Login
                        </button>
                        <button 
                            onClick={showSignup}
                            className="btn-modern text-white px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300"
                        >
                            Register
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle currentTheme={currentTheme} onThemeChange={onThemeChange} />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {!isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700 bg-black/5 backdrop-blur-md">
                            <a href="#dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors">
                                Dashboard
                            </a>
                            <a href="#report" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors">
                                Report Issue
                            </a>
                            <a href="#complaints" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors">
                                View Complaints
                            </a>
                            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col space-y-2">
                                    <button 
                                        onClick={() => { showLogin(); setIsOpen(false); }}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium border border-primary-600 dark:border-primary-400 transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button 
                                        onClick={() => { showSignup(); setIsOpen(false); }}
                                        className="bg-primary-600 hover:bg-primary-700 text-white block w-full text-left px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
