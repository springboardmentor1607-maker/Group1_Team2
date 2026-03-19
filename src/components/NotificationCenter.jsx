import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const NotificationCenter = ({ isOpen, onClose, onUnreadUpdate }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            if (response.success) {
                setNotifications(response.data);
                setUnreadCount(response.unreadCount);
                if (onUnreadUpdate) onUnreadUpdate(response.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            if (onUnreadUpdate) onUnreadUpdate(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            try {
                await api.put(`/notifications/${notif.id}/mark-read`);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
                if (onUnreadUpdate) onUnreadUpdate(Math.max(0, unreadCount - 1));
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }
        onClose();
        navigate('/notifications');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString();
    };

    const getIconAndColor = (type) => {
        switch (type) {
            case 'success':
            case 'resolved':
                return { Icon: CheckCircle, color: 'text-success bg-success-subtle' };
            case 'warning':
            case 'alert':
                return { Icon: AlertTriangle, color: 'text-warning bg-warning-subtle' };
            case 'info':
            case 'complaint_submitted':
            case 'complaint_assigned':
            case 'volunteer_submitted':
                return { Icon: Info, color: 'text-primary bg-primary-subtle' };
            case 'comment':
                return { Icon: MessageSquare, color: 'text-info bg-info-subtle' };
            default:
                return { Icon: Info, color: 'text-secondary bg-secondary-subtle' };
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for closing */}
                    <motion.div
                        className="position-fixed top-0 start-0 w-100 h-100"
                        style={{ zIndex: 1040 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Dropdown Content */}
                    <motion.div
                        className="notification-dropdown shadow-lg border"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <div className="notification-header d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="mb-0 fw-bold">Notifications</h6>
                                <small className="text-secondary">
                                    {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}
                                </small>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllRead}
                                    className="btn btn-link text-primary p-0 text-decoration-none small fw-medium d-flex align-items-center gap-1"
                                >
                                    <Check size={14} />
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="notification-list custom-scrollbar">
                            {loading ? (
                                <div className="p-4 text-center">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.slice(0, 10).map((notif) => {
                                    const { Icon, color } = getIconAndColor(notif.type);
                                    return (
                                        <div 
                                            key={notif.id} 
                                            className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className={`notification-icon-wrapper ${color}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <h6 className="mb-0 fw-semibold fs-7 text-truncate">{notif.title}</h6>
                                                    <small className="text-secondary flex-shrink-0 ms-2" style={{ fontSize: '11px' }}>
                                                        {formatTime(notif.created_at)}
                                                    </small>
                                                </div>
                                                <p className="mb-0 text-secondary small text-truncate-2">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-5 text-center">
                                    <Bell className="text-muted mb-2" size={32} opacity={0.3} />
                                    <p className="text-secondary small mb-0">No notifications yet</p>
                                </div>
                            )}
                        </div>

                        <div className="notification-footer">
                            <button 
                                className="btn btn-light w-100 rounded-pill py-2 small fw-bold"
                                onClick={() => {
                                    onClose();
                                    navigate('/notifications');
                                }}
                                style={{ background: 'var(--hover-item-bg)', border: 'none', color: 'var(--bs-body-color)' }}
                            >
                                See All Notifications
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationCenter;
