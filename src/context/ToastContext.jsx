import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBubble from '../components/NotificationBubble';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [allNotifications, setAllNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const updateNotifications = useCallback((notifications, count) => {
        setAllNotifications(notifications);
        setUnreadCount(count);
    }, []);

    const addToast = useCallback((toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, ...toast }]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/';

    return (
        <ToastContext.Provider value={{ addToast, removeToast, updateNotifications, allNotifications, unreadCount }}>
            {children}
            
            {/* Real-time Notification Bubble (Separate from Chatbot) - Hidden on Auth Pages */}
            {!isAuthPage && (
                <NotificationBubble 
                    notifications={allNotifications} 
                    unreadCount={unreadCount} 
                />
            )}

            {/* Standard Toasts (Relocated to Top-Right to avoid clutter) */}
            <div 
                className="toast-container position-fixed top-0 end-0 p-3 mt-4" 
                style={{ zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ toast, onRemove }) => {
    const { title, message, type = 'info', onClick } = toast;
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate('/notifications');
        }
        onRemove();
    };
    
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="text-success" size={20} />;
            case 'error': return <AlertCircle className="text-danger" size={20} />;
            case 'warning': return <AlertCircle className="text-warning" size={20} />;
            case 'info':
            default: return <Info className="text-primary" size={20} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="toast show shadow-lg border-0 bg-white"
            role="alert"
            onClick={handleClick}
            style={{ 
                minWidth: '300px', 
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer'
            }}
        >
            <div className="d-flex p-3">
                <div className="me-3 mt-1">
                    <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', background: 'var(--bs-light)' }}
                    >
                        {getIcon()}
                    </div>
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1 fw-bold">{title}</h6>
                        <button 
                            type="button" 
                            className="btn-close ms-2" 
                            onClick={onRemove}
                            style={{ fontSize: '0.7rem' }}
                        ></button>
                    </div>
                    <p className="mb-0 text-secondary small line-clamp-2">{message}</p>
                </div>
            </div>
            <div 
                className="toast-progress" 
                style={{ 
                    height: '3px', 
                    background: 'var(--bs-primary)',
                    width: '100%',
                    transformOrigin: 'left'
                }}
            >
                <motion.div 
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 5, ease: "linear" }}
                    style={{ 
                        height: '100%', 
                        background: 'rgba(0,0,0,0.1)',
                        width: '100%'
                    }}
                />
            </div>
        </motion.div>
    );
};
