import React from 'react';
import NewSidebar from './NewSidebar';
import NewHeader from './NewHeader';

export default function DashboardLayout({ children, onLogout, currentTheme, onThemeChange }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    React.useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined' && userData !== 'null') {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser && typeof parsedUser === 'object') {
                    setUser(parsedUser);
                } else {
                    // Set default user if parsing results in invalid data
                    const defaultUser = {
                        name: 'Guest User',
                        email: 'guest@example.com',
                        avatar: null
                    };
                    setUser(defaultUser);
                    localStorage.setItem('user', JSON.stringify(defaultUser));
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Clear invalid data and set default user
                localStorage.removeItem('user');
                const defaultUser = {
                    name: 'Guest User',
                    email: 'guest@example.com',
                    avatar: null
                };
                setUser(defaultUser);
                localStorage.setItem('user', JSON.stringify(defaultUser));
            }
        } else {
            // Set default user if no valid data exists
            const defaultUser = {
                name: 'Guest User',
                email: 'guest@example.com',
                avatar: null
            };
            setUser(defaultUser);
            localStorage.setItem('user', JSON.stringify(defaultUser));
        }

        // Handle window resize for responsive behavior
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth < 992) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isLargeScreen = windowWidth >= 992;
    const sidebarWidth = isLargeScreen ? (sidebarOpen ? 280 : 80) : 0;

    return (
        <div className="dashboard-layout min-vh-100">
            <NewSidebar 
                isOpen={sidebarOpen} 
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                onLogout={onLogout} 
                user={user} 
            />

            {/* Mobile Overlay */}
            {!isLargeScreen && sidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div 
                className="dashboard-content d-flex flex-column min-vh-100"
                style={{ 
                    paddingTop: '70px',
                    marginLeft: isLargeScreen ? `${sidebarWidth}px` : '0',
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <NewHeader 
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                    user={user} 
                    sidebarWidth={isLargeScreen ? sidebarWidth : 0}
                    currentTheme={currentTheme}
                    onThemeChange={onThemeChange}
                />
                
                <main className="main-content flex-grow-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

