import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ArrowRight, Clock, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBubble({ notifications = [], unreadCount = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
            case 'resolved':
                return <CheckCircle className="text-success" size={16} />;
            case 'error':
            case 'danger':
                return <AlertTriangle className="text-danger" size={16} />;
            case 'warning':
                return <AlertTriangle className="text-warning" size={16} />;
            case 'complaint_submitted':
            case 'complaint_assigned':
                return <Bell className="text-primary" size={16} />;
            default:
                return <Info className="text-secondary" size={16} />;
        }
    };

    if (unreadCount === 0 && !isOpen) return null;

    return (
        <div className="position-fixed top-0 end-0 p-3 z-50" style={{ marginTop: '15px', marginRight: '20px' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="card border-0 shadow-lg overflow-hidden mb-3 rounded-4"
                        style={{
                            width: '350px',
                            height: '500px',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-glass)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 text-white d-flex align-items-center justify-content-between"
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                            <div className="d-flex align-items-center gap-2">
                                <Bell size={18} />
                                <h6 className="m-0 fw-bold">Recent Activity</h6>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn btn-link p-1 text-white border-0 opacity-75 hover-opacity-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2" style={{ maxHeight: '380px' }}>
                            {notifications.length === 0 ? (
                                <div className="text-center py-5 opacity-50 my-auto">
                                    <Bell size={40} className="mx-auto mb-2" />
                                    <p className="small mb-0">No activity yet</p>
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <motion.div 
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            navigate('/notifications');
                                            setIsOpen(false);
                                        }}
                                        className={`p-3 rounded-4 cursor-pointer transition-all hover-shadow-sm d-flex gap-3 ${notif.is_read ? 'bg-light bg-opacity-50' : 'bg-white shadow-sm border-start border-4 border-primary'}`}
                                        style={{ border: '1px solid var(--border-color)' }}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <h6 className={`small mb-1 fw-bold text-truncate ${notif.is_read ? 'text-dark' : 'text-primary'}`}>{notif.title}</h6>
                                            <p className="small text-muted mb-1 line-clamp-2" style={{ fontSize: '0.75rem' }}>{notif.message}</p>
                                            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.65rem' }}>
                                                <Clock size={10} />
                                                <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-white border-top border-light mt-auto">
                            <button 
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="btn btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-semibold py-2"
                                style={{ fontSize: '0.85rem' }}
                            >
                                View Notification Center
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Toggle Button - Refined Design */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn d-flex align-items-center justify-content-center ms-auto position-relative"
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'var(--card-bg)',
                    color: 'var(--bs-primary)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '0'
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                            <X size={20} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="bell"
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Bell size={20} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Badge */}
                {!isOpen && unreadCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0, x: 5, y: -5 }}
                        animate={{ scale: 1, x: 0, y: 0 }}
                        className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger border border-2 border-white shadow-sm"
                        style={{ fontSize: '0.65rem', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {unreadCount > 9 ? '!' : unreadCount}
                    </motion.span>
                )}
            </motion.button>
        </div>
    );
}
