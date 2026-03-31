import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, MapPin, FileText, User, Settings, LogOut, AlertTriangle, Shield, ClipboardList, Bell } from 'lucide-react';

const NewSidebar = ({ isOpen, toggleSidebar, onLogout, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredIndex, setHoveredIndex] = React.useState(null);

    // Define menu items based on user role
    const getMenuItems = () => {
        const role = user?.role || localStorage.getItem('userRole');

        if (role === 'admin') {
            return [
                { label: 'Dashboard', path: '/dashboard', icon: Home },
                { label: 'Admin Panel', path: '/admin', icon: Shield },
                { label: 'Report Issue', path: '/report-issue', icon: AlertTriangle },
                { label: 'Complaints', path: '/complaints', icon: FileText },
                { label: 'Notifications', path: '/notifications', icon: Bell },
                { label: 'Map View', path: '/map', icon: MapPin },
                { label: 'Profile', path: '/profile', icon: User },
                { label: 'Settings', path: '/settings', icon: Settings },
            ];
        } else if (role === 'volunteer') {
            return [
                { label: 'My Assignments', path: '/volunteer', icon: ClipboardList },
                { label: 'Notifications', path: '/notifications', icon: Bell },
                { label: 'Map View', path: '/map', icon: MapPin },
                { label: 'Profile', path: '/profile', icon: User },
                { label: 'Settings', path: '/settings', icon: Settings },
            ];
        } else {
            // Citizen
            return [
                { label: 'Dashboard', path: '/dashboard', icon: Home },
                { label: 'Report Issue', path: '/report-issue', icon: AlertTriangle },
                { label: 'My Complaints', path: '/complaints?view=my', icon: FileText },
                { label: 'Notifications', path: '/notifications', icon: Bell },
                { label: 'Map View', path: '/map', icon: MapPin },
                { label: 'Profile', path: '/profile', icon: User },
                { label: 'Settings', path: '/settings', icon: Settings },
            ];
        }
    };

    const menuItems = getMenuItems();

    const initials = (user?.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <>
            {/* Sidebar */}
            <motion.aside
                className="sidebar position-fixed top-0 start-0 h-100 shadow-lg d-flex flex-column"
                style={{
                    zIndex: 1040,
                    width: isOpen ? '280px' : '80px',
                    borderRight: '1px solid var(--bs-border-color)',
                    transition: 'width 0.3s ease',
                    backgroundColor: 'var(--sidebar-bg)',
                    backdropFilter: 'blur(50px) saturate(200%)'
                }}
                initial={false}
            >
                {/* Logo Section */}
                <Link
                    to="/"
                    className="d-flex align-items-center px-4 py-3 border-bottom text-decoration-none"
                    style={{
                        height: '70px',
                        backgroundColor: 'transparent',
                        borderColor: 'var(--bs-border-color)'
                    }}
                >
                    <div className="d-flex align-items-center">
                        <div className="rounded-2 d-flex align-items-center justify-content-center me-3"
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--hero-gradient)'
                            }}>
                            <span className="text-white fw-bold fs-5">CS</span>
                        </div>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h5 className="mb-0 fw-bold" style={{ color: 'var(--bs-body-color)' }}>CleanStreet</h5>
                                <small style={{ color: 'var(--bs-secondary-color)' }}>Smart City Solution</small>
                            </motion.div>
                        )}
                    </div>
                </Link>

                {/* Navigation Menu */}
                <nav className="flex-grow-1 p-3">
                    <div className="nav flex-column">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                 <motion.button
                                     key={index}
                                     onClick={() => navigate(item.path)}
                                     whileHover={{ scale: 1.02, x: 4 }}
                                     whileTap={{ scale: 0.98 }}
                                     className={`btn d-flex align-items-center w-100 text-start border-0 rounded-3 mb-1 p-2 position-relative ${isActive
                                         ? 'nav-link active'
                                         : 'bg-transparent'
                                         }`}
                                     style={{
                                         background: isActive
                                             ? 'var(--active-item-bg)'
                                             : 'transparent',
                                         color: isActive ? 'var(--active-item-color)' : 'var(--bs-body-color)',
                                         boxShadow: isActive
                                             ? '0 4px 12px rgba(66, 133, 244, 0.15)'
                                             : 'none',
                                         transition: 'all 0.3s ease'
                                     }}
                                     onMouseEnter={(e) => {
                                         if (!isActive) {
                                             e.target.style.backgroundColor = 'var(--hover-item-bg)';
                                         }
                                         if (!isOpen) setHoveredIndex(index);
                                     }}
                                     onMouseLeave={(e) => {
                                         if (!isActive) {
                                             e.target.style.backgroundColor = 'transparent';
                                         }
                                         setHoveredIndex(null);
                                     }}
                                 >
                                     <Icon
                                         size={18}
                                         strokeWidth={1.5}
                                         className={`${isOpen ? 'me-3' : ''} flex-shrink-0`}
                                         style={{ minWidth: '18px' }}
                                     />
                                     {isOpen && (
                                         <motion.span
                                             initial={{ opacity: 0 }}
                                             animate={{ opacity: 1 }}
                                             className="fw-medium"
                                         >
                                             {item.label}
                                         </motion.span>
                                     )}
                                     
                                     {/* Tooltip for collapsed state */}
                                     {!isOpen && hoveredIndex === index && (
                                         <motion.div
                                             initial={{ opacity: 0, x: -10 }}
                                             animate={{ opacity: 1, x: 0 }}
                                             className="position-absolute px-3 py-2 rounded-2 shadow-lg fw-bold"
                                             style={{
                                                 left: '70px',
                                                 backgroundColor: 'var(--hero-gradient)',
                                                 background: 'var(--hero-gradient)',
                                                 color: 'white',
                                                 fontSize: '0.85rem',
                                                 zIndex: 1100,
                                                 whiteSpace: 'nowrap',
                                                 pointerEvents: 'none'
                                             }}
                                         >
                                             {item.label}
                                             {/* Arrow */}
                                             <div className="position-absolute top-50 start-0 translate-middle" 
                                                  style={{ 
                                                      width: '0', 
                                                      height: '0', 
                                                      borderTop: '6px solid transparent',
                                                      borderBottom: '6px solid transparent',
                                                      borderRight: '6px solid #4285f4', // Approximate color from gradient start
                                                      marginLeft: '-2px'
                                                  }} 
                                             />
                                         </motion.div>
                                     )}

                                     {isActive && (
                                         <motion.div
                                             className="position-absolute top-50 translate-middle-y rounded-pill"
                                             style={{ right: '8px', width: '4px', height: '20px', backgroundColor: 'var(--active-item-color)' }}
                                             initial={{ scale: 0 }}
                                             animate={{ scale: 1 }}
                                         />
                                     )}
                                 </motion.button>
                             );
                         })}
                     </div>
                 </nav>
 
                {/* User Section */}
                <div className="p-3 border-top" style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--bs-border-color)'
                }}>

                    {/* Logout Button */}
                    <motion.button
                        onClick={onLogout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`btn text-danger w-100 d-flex align-items-center rounded-3 p-3 position-relative ${!isOpen ? 'justify-content-center' : ''}`}
                        style={{ transition: 'all 0.3s ease', background: 'transparent', border: 'none' }}
                        onMouseEnter={() => !isOpen && setHoveredIndex('logout')}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <LogOut size={20} className={`${isOpen ? 'me-3' : ''}`} />
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="fw-medium"
                            >
                                Logout
                            </motion.span>
                        )}

                        {!isOpen && hoveredIndex === 'logout' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="position-absolute px-3 py-2 rounded-2 shadow-lg fw-bold bg-danger"
                                style={{
                                    left: '70px',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    zIndex: 1100,
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none'
                                }}
                            >
                                Logout
                                <div className="position-absolute top-50 start-0 translate-middle" 
                                     style={{ 
                                         width: '0', 
                                         height: '0', 
                                         borderTop: '6px solid transparent',
                                         borderBottom: '6px solid transparent',
                                         borderRight: '6px solid #dc3545',
                                         marginLeft: '-2px'
                                     }} 
                                />
                            </motion.div>
                        )}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
                    style={{ zIndex: 1030 }}
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default NewSidebar;