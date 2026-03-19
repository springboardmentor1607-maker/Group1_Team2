import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare, Trash2, Check, Filter, X } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { api } from '../lib/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            if (response.success) {
                setNotifications(response.data);
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
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const clearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            try {
                await api.delete('/notifications/clear-all');
                setNotifications([]);
            } catch (err) {
                console.error('Failed to clear all notifications:', err);
            }
        }
    };

    const deleteOne = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const markOneRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/mark-read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const formatTime = (dateString, type = 'relative') => {
        const date = new Date(dateString);
        if (type === 'full') {
            return date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
        
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
    
    const filteredNotifications = filter === 'all' 
        ? notifications 
        : filter === 'unread'
            ? notifications.filter(n => !n.is_read)
            : filter === 'citizen'
                ? notifications.filter(n => n.type === 'complaint_submitted' || n.type === 'status_changed')
                : filter === 'volunteer'
                    ? notifications.filter(n => n.type === 'volunteer_submitted' || n.type === 'complaint_assigned')
                    : notifications;

    return (
        <PageWrapper className="container-xxl py-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h2 className="fw-bold mb-1">Notifications</h2>
                            <p className="text-secondary mb-0">Stay updated with the latest activity in your area</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                onClick={markAllRead}
                                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                disabled={!notifications.some(n => !n.is_read)}
                            >
                                <Check size={16} />
                                <span className="d-none d-sm-inline">Mark all as read</span>
                            </button>
                            <button 
                                onClick={clearAll}
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                                disabled={notifications.length === 0}
                            >
                                <Trash2 size={16} />
                                <span className="d-none d-sm-inline">Clear all</span>
                            </button>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="card-header bg-transparent border-bottom p-3 d-flex align-items-center justify-content-between">
                            <div className="nav nav-pills gap-2">
                                <button 
                                    className={`nav-link py-1 px-3 rounded-pill small ${filter === 'all' ? 'active bg-primary' : 'text-secondary'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button 
                                    className={`nav-link py-1 px-3 rounded-pill small ${filter === 'unread' ? 'active bg-primary' : 'text-secondary'}`}
                                    onClick={() => setFilter('unread')}
                                >
                                    Unread
                                </button>
                                {userRole === 'admin' && (
                                    <>
                                        <button 
                                            className={`nav-link py-1 px-3 rounded-pill small ${filter === 'citizen' ? 'active bg-primary' : 'text-secondary'}`}
                                            onClick={() => setFilter('citizen')}
                                        >
                                            Citizen Reports
                                        </button>
                                        <button 
                                            className={`nav-link py-1 px-3 rounded-pill small ${filter === 'volunteer' ? 'active bg-primary' : 'text-secondary'}`}
                                            onClick={() => setFilter('volunteer')}
                                        >
                                            Volunteer Activity
                                        </button>
                                    </>
                                )}
                            </div>
                            <button className="btn btn-light btn-sm rounded-pill p-2 d-flex align-items-center justify-content-center">
                                <Filter size={14} />
                            </button>
                        </div>

                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-5 text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-secondary">Fetching notifications...</p>
                                </div>
                            ) : filteredNotifications.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {filteredNotifications.map((notif, index) => {
                                        const { Icon, color } = getIconAndColor(notif.type);
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={notif.id}
                                                className={`list-group-item p-4 border-0 border-bottom position-relative transition-all ${!notif.is_read ? 'bg-primary bg-opacity-10' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => !notif.is_read && markOneRead(notif.id)}
                                            >
                                                {!notif.is_read && (
                                                    <div 
                                                        className="position-absolute bg-primary rounded-circle" 
                                                        style={{ 
                                                            width: '8px', 
                                                            height: '8px', 
                                                            left: '12px', 
                                                            top: '50%', 
                                                            transform: 'translateY(-50%)',
                                                            boxShadow: '0 0 0 4px rgba(var(--bs-primary-rgb), 0.1)' 
                                                        }}
                                                    />
                                                )}
                                                <div className="d-flex gap-4">
                                                    <div className={`notification-icon-wrapper rounded-4 ${color} d-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
                                                        <Icon size={28} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1 pe-5">
                                                            <h5 className="mb-0 fw-bold fs-6 pe-3">{notif.title}</h5>
                                                            <div className="text-end">
                                                                <p className="mb-0 small fw-medium text-body">{formatTime(notif.created_at)}</p>
                                                                <p className="mb-0 text-secondary" style={{ fontSize: '11px' }}>{formatTime(notif.created_at, 'full')}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-secondary mb-0 mt-2 pe-md-5 lh-base">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="position-absolute d-flex align-items-center gap-3" style={{ top: '24px', right: '24px' }}>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteOne(notif.id);
                                                        }}
                                                        className="btn btn-link p-1 text-secondary hover-danger opacity-50 bg-light rounded-circle d-flex align-items-center justify-content-center border-0" 
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-5 text-center">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                                        <Bell className="text-muted" size={40} />
                                    </div>
                                    <h5 className="fw-bold">No notifications yet</h5>
                                    <p className="text-secondary">We'll let you know when something important happens.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
