import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Info, UserPlus, MapPin, Zap, Shield } from 'lucide-react';

const ActivityItem = ({ type, message, time, statusText, category, title, index }) => {
    const getIconDetails = () => {
        switch (type) {
            case 'resolved': return { icon: <CheckCircle size={16} />, color: '#10b981' };
            case 'status_changed': return { icon: <Zap size={16} />, color: '#3b82f6' };
            case 'complaint_submitted': return { icon: <AlertCircle size={16} />, color: '#f59e0b' };
            case 'complaint_assigned': return { icon: <Clock size={16} />, color: '#6366f1' };
            case 'volunteer_registered': return { icon: <UserPlus size={16} />, color: '#10b981' };
            case 'zone_added': return { icon: <MapPin size={16} />, color: '#8b5cf6' };
            default: return { icon: <Info size={16} />, color: '#64748b' };
        }
    };

    const details = getIconDetails();

    const formatTime = (t) => {
        if (!t) return 'Just now';
        const d = new Date(t);
        if (isNaN(d.getTime())) return t;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
            className="d-flex align-items-center gap-4 p-4 mb-3 glass-card-premium rounded-premium transition-all hover-scale-sm position-relative overflow-hidden shadow-sm"
            style={{ 
                background: 'rgba(255, 255, 255, 0.7)',
                borderLeft: `4px solid ${details.color}`
            }}
        >
            <div className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle" 
                 style={{ width: '42px', height: '42px', background: `${details.color}15`, color: details.color }}>
                {details.icon}
            </div>
            
            <div className="flex-grow-1 min-w-0 ps-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="fs-6 fw-800 mb-0 text-truncate" style={{ color: '#0f172a' }}>
                        {title || message}
                    </h5>
                    <span className="small fw-700 opacity-60" style={{ fontSize: '0.7rem' }}>
                        {formatTime(time)}
                    </span>
                </div>
                <p className="small text-muted mb-0 text-truncate fw-500">
                    {message !== title ? message : (category || 'System Event')}
                </p>
            </div>

            {statusText && (
                <div className="flex-shrink-0 ms-auto">
                    <span className="badge rounded-pill px-3 py-2 small fw-bold" 
                          style={{ 
                              backgroundColor: `${details.color}10`,
                              color: details.color,
                              border: `1px solid ${details.color}20`
                          }}>
                        {statusText.toUpperCase()}
                    </span>
                </div>
            )}
        </motion.div>
    );
};


export default function RecentActivity({ activities = [] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center p-5 text-muted small opacity-50">
                <p>Waiting for live events...</p>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column">
            <AnimatePresence>
                {activities.slice(0, 10).map((activity, idx) => (
                    <ActivityItem 
                        key={activity.id || idx} 
                        {...activity} 
                        index={idx}
                        time={activity.created_at || activity.time} 
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}



