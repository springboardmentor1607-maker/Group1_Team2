import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Clock, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const NotificationItem = ({ type, title, message, created_at, is_read }) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
            case 'resolved':
                return <CheckCircle className="w-5 h-5 text-success" />;
            case 'error':
            case 'danger':
                return <AlertCircle className="w-5 h-5 text-danger" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-warning" />;
            case 'complaint_submitted':
                return <Bell className="w-5 h-5 text-primary" />;
            default:
                return <Info className="w-5 h-5 text-secondary" />;
        }
    };

    return (
        <div className={`d-flex align-items-start gap-3 p-3 rounded-xl transition-colors mb-2 ${is_read ? 'bg-transparent' : 'bg-primary bg-opacity-10 border border-primary border-opacity-10'}`} style={{ border: '1px solid transparent' }}>
            <div className="mt-1 flex-shrink-0">
                <div className="p-2 bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center">
                    {getIcon()}
                </div>
            </div>
            <div className="flex-grow-1 min-w-0">
                <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className={`small mb-0 fw-bold text-truncate ${is_read ? 'text-body' : 'text-primary'}`}>{title}</h6>
                    {!is_read && <span className="p-1 bg-primary rounded-circle" style={{ width: '6px', height: '6px' }}></span>}
                </div>
                <p className="small text-body-secondary mb-1 line-clamp-2" style={{ fontSize: '0.75rem' }}>{message}</p>
                <div className="d-flex align-items-center gap-1 text-body-secondary" style={{ fontSize: '0.7rem' }}>
                    <Clock size={10} />
                    <span>{new Date(created_at).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default function RecentNotifications({ limit = 5 }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                if (response.success) {
                    setNotifications(response.data.slice(0, limit));
                }
            } catch (err) {
                console.error('Error fetching recent notifications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [limit]);

    if (loading) {
        return (
            <div className="card border-0 shadow-lg p-4 rounded-xl">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="bg-light rounded" style={{ width: '150px', height: '20px' }}></div>
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="mb-3 d-flex gap-3">
                        <div className="bg-light rounded-circle" style={{ width: '40px', height: '40px' }}></div>
                        <div className="flex-grow-1">
                            <div className="bg-light rounded mb-2" style={{ width: '60%', height: '15px' }}></div>
                            <div className="bg-light rounded" style={{ width: '90%', height: '12px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-0 shadow-lg p-4 rounded-xl"
            style={{ minHeight: '400px' }}
        >
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="fs-5 fw-bold text-body mb-0 d-flex align-items-center gap-2">
                    <Bell size={20} className="text-primary" />
                    Latest Updates
                </h3>
            </div>

            <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: '450px' }}>
                {notifications.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-3 opacity-20">
                            <Bell size={48} className="mx-auto" />
                        </div>
                        <p className="text-body-secondary small">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <NotificationItem key={notif.id} {...notif} />
                    ))
                )}
            </div>

            <button 
                onClick={() => navigate('/notifications')}
                className="btn btn-light w-100 mt-3 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-semibold text-primary transition-all border-0 shadow-sm hover-shadow"
            >
                View Notification Center
                <ArrowRight size={16} />
            </button>
        </motion.div>
    );
}
