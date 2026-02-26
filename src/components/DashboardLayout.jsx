import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
    Menu,
    Moon,
    Sun,
    Home,
    FileText,
    Map as MapIcon,
    Settings,
    LogOut,
    User,
    Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from './ChatWidget';

/* ===================== SIDEBAR ===================== */
const Sidebar = ({ isOpen, closeSidebar, onLogout }) => {
    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Complaints', path: '/complaints' },
        { icon: MapIcon, label: 'Map View', path: '/map' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <motion.aside
            className={cn(
                "position-fixed start-0 top-0 z-40 h-100 bg-card border-end",
                isOpen ? "w-64" : "w-20"
            )}
            animate={{ width: isOpen ? 256 : 80 }}
        >
            {/* ===== LOGO ===== */}
            <div className="d-flex align-items-center justify-content-center gap-2 h-16 border-bottom overflow-hidden px-3">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22C55E" />
                            <stop offset="100%" stopColor="#14B8A6" />
                        </linearGradient>
                    </defs>
                    <rect width="32" height="32" rx="6" fill="url(#logoGradient)" />
                    <rect x="6" y="18" width="4" height="8" fill="white" />
                    <rect x="11" y="15" width="4" height="11" fill="white" />
                    <rect x="16" y="17" width="4" height="9" fill="white" />
                    <rect x="21" y="19" width="4" height="7" fill="white" />
                    <rect
                        x="13"
                        y="13"
                        width="2"
                        height="8"
                        rx="1"
                        fill="white"
                        transform="rotate(-45 14 14)"
                    />
                    <circle cx="20" cy="8" r="1.5" fill="white" />
                    <circle cx="24" cy="10" r="1" fill="white" />
                    <circle cx="18" cy="11" r="1" fill="white" />
                </svg>
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fw-bold fs-5 text-body text-nowrap"
                    >
                        CleanStreet
                    </motion.span>
                )}
            </div>

            {/* ===== MENU ===== */}
            <nav className="p-3 d-flex flex-column gap-2">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            cn(
                                "nav-link d-flex align-items-center p-3 rounded text-decoration-none transition-colors",
                                isActive ? "active" : "text-body-secondary"
                            )
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        {isOpen && <span className="ms-3">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* ===== LOGOUT ===== */}
            <div className="position-absolute bottom-0 w-100 p-3 border-top">
                <button
                    onClick={onLogout}
                    className="d-flex align-items-center w-100 p-3 text-danger btn btn-link text-decoration-none rounded nav-link"
                >
                    <LogOut className="w-6 h-6" />
                    {isOpen && <span className="ms-3">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
};

/* ===================== HEADER ===================== */
const Header = ({ toggleSidebar, sidebarOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const getTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return 'Dashboard Overview';
            case '/profile': return 'Profile';
            case '/complaints': return 'Complaints';
            case '/map': return 'Map View';
            case '/report-issue': return 'Report a Civic Issue';
            case '/settings': return 'Settings';
            default: return '';
        }
    };

    const isReportPage = location.pathname === '/report-issue';
    const navigate = useNavigate();

    return (
        <header
            className={cn(
                "h-16 bg-card border-bottom d-flex align-items-center justify-content-between px-3 position-fixed top-0 end-0 z-30 transition-all",
                sidebarOpen ? "lg:left-64" : "lg:left-20"
            )}
        >
            <div className="d-flex align-items-center gap-3">
                <button onClick={toggleSidebar} className="btn p-2 d-lg-none text-body">
                    <Menu />
                </button>

                <h2 className="fs-4 fw-semibold m-0 text-body">{getTitle()}</h2>
            </div>

            <div className="d-flex align-items-center gap-3">
                {!isReportPage && (
                    <button
                        onClick={() => navigate('/report-issue')}
                        className="btn btn-primary d-flex align-items-center shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)',
                            border: 'none'
                        }}
                    >
                        <Plus className="w-4 h-4 me-2" />
                        Report Issue
                    </button>
                )}

                <button onClick={toggleTheme} className="btn text-body">
                    {theme === 'light' ? <Moon /> : <Sun />}
                </button>
            </div>
        </header>
    );
};

/* ===================== LAYOUT ===================== */
export default function DashboardLayout({ children, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-body">
            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                onLogout={onLogout}
            />

            <Header
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
            />

            {/* ✅ PERFECT SPACING */}
            <main
                className={cn(
                    "pt-28 px-4 transition-all",
                    sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                )}
            >
                {children}
            </main>

            {/* Chat Widget Fixed to Bottom Right */}
            <ChatWidget />
        </div>
    );
}