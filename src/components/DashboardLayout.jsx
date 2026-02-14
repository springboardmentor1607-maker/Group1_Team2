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
    User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
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
                "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
                isOpen ? "w-64" : "w-0 lg:w-20"
            )}
            animate={{ width: isOpen ? 256 : 80 }}
        >
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                <h1 className={cn(
                    "text-2xl font-bold text-primary-600 dark:text-primary-400 overflow-hidden whitespace-nowrap",
                    !isOpen && "lg:hidden"
                )}>
                    CleanStreet
                </h1>

                {!isOpen && (
                    <span className="hidden lg:block text-2xl font-bold text-primary-600">
                        CS
                    </span>
                )}
            </div>

            {/* Menu */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center w-full p-3 rounded-lg transition-colors group",
                                isActive
                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )
                        }
                    >
                        <item.icon className="w-6 h-6 flex-shrink-0" />

                        <span className={cn(
                            "ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                            !isOpen && "lg:opacity-0 lg:w-0"
                        )}>
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <LogOut className="w-6 h-6 flex-shrink-0" />
                    <span className={cn(
                        "ml-3 font-medium whitespace-nowrap overflow-hidden",
                        !isOpen && "lg:hidden"
                    )}>
                        Logout
                    </span>
                </button>
            </div>
        </motion.aside>
    );
};

const Header = ({ toggleSidebar, sidebarOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const getTitle = () => {
        switch (location.pathname) {
            case '/dashboard':
                return 'Dashboard Overview';
            case '/profile':
                return 'Profile';
            case '/complaints':
                return 'Complaints';
            case '/map':
                return 'Map View';
            case '/settings':
                return 'Settings';
            default:
                return '';
        }
    };

    return (
        <header
            className={cn(
                "h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 z-30 transition-all duration-300",
                sidebarOpen ? "lg:left-64" : "lg:left-20"
            )}
        >
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                >
                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>

                <h2 className="text-xl font-semibold text-gray-800 dark:text-white ml-2 lg:ml-0">
                    {getTitle()}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                    {theme === 'light'
                        ? <Moon className="w-5 h-5" />
                        : <Sun className="w-5 h-5" />}
                </button>

                <NavLink to="/profile">
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                John Doe
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Citizen
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                    </div>
                </NavLink>
            </div>
        </header>
    );
};

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
            />

            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            <div
                className={cn(
                    "transition-all duration-300 pt-16 min-h-screen flex flex-col",
                    sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                )}
            >
                <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={closeSidebar}
                />
            )}
        </div>
    );
}