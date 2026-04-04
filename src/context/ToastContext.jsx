import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        setTimeout(() => removeToast(id), duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toastIcons = {
        success: <CheckCircle className="text-success" size={20} />,
        error: <XCircle className="text-danger" size={20} />,
        warning: <AlertCircle className="text-warning" size={20} />,
        info: <Info className="text-info" size={20} />,
    };

    const toastStyles = {
        success: 'border-success-subtle bg-success-subtle text-success-emphasis',
        error: 'border-danger-subtle bg-danger-subtle text-danger-emphasis',
        warning: 'border-warning-subtle bg-warning-subtle text-warning-emphasis',
        info: 'border-info-subtle bg-info-subtle text-info-emphasis',
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 9999 }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={`toast show border rounded-3 shadow-sm mb-3 d-flex align-items-center p-3 animate-slide-in ${toastStyles[toast.type]}`}
                            style={{ 
                                minWidth: '300px', 
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <div className="me-3">{toastIcons[toast.type]}</div>
                            <div className="flex-grow-1 fw-bold small">{toast.message}</div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="btn btn-link p-0 ms-2 text-muted border-0"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
