import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, Search, Bell, ChevronDown } from 'lucide-react';

const NewHeader = ({ toggleSidebar, user, sidebarWidth = 80 }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'Dashboard Overview';
            case '/profile':
                return 'My Profile';
            case '/complaints':
                return 'Complaints';
            case '/map':
                return 'Map View';
            case '/settings':
                return 'Settings';
            default:
                return 'CleanStreet';
        }
    };

    const getPageDescription = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'Monitor city cleanliness and track reports';
            case '/profile':
                return 'Manage your account information';
            case '/complaints':
                return 'View and manage citizen complaints';
            case '/map':
                return 'Interactive city map with real-time data';
            case '/settings':
                return 'Customize your preferences';
            default:
                return 'Smart city cleanliness management';
        }
    };

    return (
        <motion.header
            className="bg-card position-fixed top-0 end-0 border-bottom shadow-sm d-flex align-items-center justify-content-between px-4 py-3"
            style={{ 
                height: '70px', 
                zIndex: 1020,
                left: `${sidebarWidth}px`,
                borderColor: 'var(--bs-border-color)',
                transition: 'left 0.3s ease'
            }}
            initial={{ y: -70 }}
            animate={{ y: 0 }}
        >
            {/* Left Section - Menu & Title */}
            <div className="d-flex align-items-center min-w-0 flex-grow-1">
                {/* Mobile Menu Toggle */}
                <motion.button 
                    onClick={toggleSidebar} 
                    className="btn btn-light rounded-3 p-2 me-3 d-lg-none border-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: 'var(--hover-item-bg)' }}
                >
                    <Menu size={20} />
                </motion.button>

                {/* Page Title & Description */}
                <div className="min-w-0 flex-grow-1">
                    <motion.h1 
                        className="fs-4 fw-bold mb-0"
                        style={{ color: 'var(--bs-body-color)' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={location.pathname}
                    >
                        {getPageTitle()}
                    </motion.h1>
                    <motion.p 
                        className="mb-0 small d-none d-sm-block"
                        style={{ color: 'var(--bs-secondary-color)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {getPageDescription()}
                    </motion.p>
                </div>
            </div>

            {/* Right Section - Actions & User */}
            <div className="d-flex align-items-center gap-3 flex-shrink-0">
                {/* Search Button */}
                <motion.button
                    className="btn btn-light rounded-3 p-2 border-0 d-none d-md-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: 'var(--hover-item-bg)' }}
                >
                    <Search size={18} />
                </motion.button>

                {/* Notifications */}
                <motion.button
                    className="btn btn-light rounded-3 p-2 border-0 position-relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: 'var(--hover-item-bg)' }}
                >
                    <Bell size={18} />
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '10px' }}
                    >
                        3
                    </span>
                </motion.button>

                {/* Theme Toggle */}
                <motion.button
                    onClick={toggleTheme}
                    className="btn btn-light rounded-3 p-2 border-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: 'var(--hover-item-bg)' }}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </motion.button>

                {/* Divider */}
                <div 
                    className="d-none d-sm-block" 
                    style={{ 
                        width: '1px', 
                        height: '30px', 
                        backgroundColor: 'var(--bs-border-color)' 
                    }}
                />

                {/* User Profile */}
                <motion.div 
                    className="d-flex align-items-center gap-3 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    style={{ cursor: 'pointer' }}
                >
                    {/* User Info (Hidden on small screens) */}
                    <div className="text-end d-none d-lg-block">
                        <p className="mb-0 fw-semibold" style={{ fontSize: '14px', color: 'var(--bs-body-color)' }}>
                            {user?.name || 'User'}
                        </p>
                        <p className="mb-0 text-capitalize" style={{ fontSize: '12px', color: 'var(--bs-secondary-color)' }}>
                            {user?.role || 'Citizen'}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ 
                            width: '42px', 
                            height: '42px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '14px'
                        }}
                    >
                        {(user?.name || 'U')[0].toUpperCase()}
                    </div>

                    {/* Dropdown Arrow */}
                    <ChevronDown size={16} className="d-none d-lg-block" style={{ color: 'var(--bs-secondary-color)' }} />
                </motion.div>
            </div>
        </motion.header>
    );
};

export default NewHeader;