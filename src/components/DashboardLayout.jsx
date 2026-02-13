import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, FileText, User, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, onLogout, user }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'Complaints', path: '/complaints', icon: FileText },
        { label: 'Map View', path: '/map', icon: MapPin },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const initials = (user?.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();


    return (
        <motion.aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen glass-card bg-white/5 dark:bg-black/70 border-r border-white/20 dark:border-gray-700 backdrop-blur-xl transition-all duration-300",
                isOpen ? "w-64" : "w-0 lg:w-16 xl:w-20"
            )}
            initial={false}
            animate={{ width: isOpen ? 256 : window.innerWidth >= 1024 ? (window.innerWidth >= 1280 ? 80 : 64) : 0 }}
        >
            <div className="flex items-center justify-between h-14 sm:h-16 border-b border-white/10 px-3">
                <div className="flex items-center gap-3 min-w-0">
                    <h1 className={cn("text-lg sm:text-xl lg:text-2xl font-bold gradient-text truncate", !isOpen && "lg:hidden")}>
                        CleanStreet
                    </h1>
                    {!isOpen && <span className="hidden lg:block text-lg xl:text-2xl font-bold gradient-text">CS</span>}
                </div>
                {/* (top-left initials removed as requested) */}
            </div>

            <nav className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <motion.button
                            key={index}
                            onClick={() => navigate(item.path)}
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "flex items-center w-full p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group relative overflow-hidden text-sm sm:text-base",
                                isActive
                                    ? "bg-gradient-to-r from-primary-500/20 to-accent-1/20 text-white border border-primary-500/30 neon-glow"
                                    : "text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/10 interactive-element"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-1/10 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            {/* icon for menu item (shows in both expanded and collapsed states) */}
                            <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mr-3",
                                isActive ? "bg-gradient-to-br from-primary-500 to-accent-1 text-white" : "bg-gray-200/30 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            )}>
                                {item.icon ? (
                                    (() => {
                                        const Icon = item.icon;
                                        return <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-700 dark:text-gray-300")} aria-hidden="true" />
                                    })()
                                ) : (
                                    <span className="uppercase text-xs font-semibold">{item.label.charAt(0)}</span>
                                )}
                            </div>

                            <span className={cn("ml-0 sm:ml-0 font-medium whitespace-nowrap overflow-hidden transition-opacity duration-300", !isOpen && "lg:opacity-0 lg:w-0 lg:sr-only")}>{item.label}</span>
                        </motion.button>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                {/* user summary */}
                <div className={cn("flex items-center gap-3 px-2 py-2 rounded-lg mb-3", !isOpen && "lg:justify-center")}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-1 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                        {initials}
                    </div>
                    <div className={cn("min-w-0", !isOpen && "lg:hidden")}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role || 'Citizen'}</p>
                    </div>
                </div>

                <button 
                    onClick={onLogout}
                    className="flex items-center w-full p-2 sm:p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                >
                    <span className={cn("ml-2 sm:ml-3 font-medium whitespace-nowrap overflow-hidden", !isOpen && "lg:hidden")}>
                        Logout
                    </span>
                </button>
            </div>
        </motion.aside>
    );
};

const Header = ({ toggleSidebar, user }) => {
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

    return (
        <header className="h-14 sm:h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-4 lg:px-6 fixed top-0 right-0 left-0 z-30 lg:left-16 xl:left-20 transition-all duration-300">
            <div className="flex items-center min-w-0 flex-1">
                <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
                </button>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white ml-2 lg:ml-0 truncate">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                >
                </button>

                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-24 lg:max-w-none">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Citizen'}</p>
                    </div>
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    </div>
                </div>
            </div>
        </header>
    );
};

export default function DashboardLayout({ children, onLogout, currentTheme, onThemeChange }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [user, setUser] = React.useState(null);

    // Get user data from localStorage on component mount
    React.useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Close sidebar on route change on mobile
    React.useEffect(() => {
        // Add logic here if using router
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} user={user} />

            <div className={cn(
                "transition-all duration-300 pt-14 sm:pt-16 min-h-screen flex flex-col",
                "lg:ml-16 xl:ml-20"
            )}>
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />
                <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
