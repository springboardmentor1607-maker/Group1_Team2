import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

const ActivityItem = ({ type, message, time, statusText, category }) => {
    const getIcon = () => {
        switch (type) {
            case 'resolved': return <CheckCircle className="w-5 h-5 text-success" />;
            case 'new': return <AlertCircle className="w-5 h-5 text-danger" />;
            case 'progress': return <Clock className="w-5 h-5 text-primary" />;
            case 'in-progress': return <Clock className="w-5 h-5 text-primary" />;
            case 'pending': return <Clock className="w-5 h-5 text-warning" />;
            default: return <Info className="w-5 h-5 text-secondary" />;
        }
    };

    const getStatusColor = (status) => {
        const s = (status || 'pending').toLowerCase();
        if (s.includes('resolved')) return 'success';
        if (s.includes('progress')) return 'primary';
        return 'warning'; // Default to warning for pending
    };

    return (
        <div className="d-flex align-items-start gap-3 p-3 hover-bg-adaptive rounded transition-colors border-bottom border-light">
            <div className="mt-1">{getIcon()}</div>
            <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                        <p className="small fw-semibold text-body mb-0">{message}</p>
                        {category && (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 mt-1" style={{ fontSize: '0.65rem' }}>
                                {category.toUpperCase()}
                            </span>
                        )}
                    </div>
                    {statusText && (
                        <span className={`badge rounded-pill bg-opacity-10 text-${getStatusColor(statusText)} bg-${getStatusColor(statusText)} small`} style={{ fontSize: '0.7rem' }}>
                            {statusText}
                        </span>
                    )}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="small text-body-secondary m-0" style={{ fontSize: '0.75rem' }}>{time}</p>
                </div>
            </div>
        </div>
    );
};

export default function RecentActivity({ activities }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="card border-0 shadow-lg p-4 rounded-xl h-100"
        >
            <h3 className="fs-5 fw-semibold text-body mb-4">Recent Activity</h3>
            <div className="d-flex flex-column gap-1">
                {activities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </div>
            <button className="btn btn-link w-100 mt-3 text-primary text-decoration-none fw-medium">
                View All Activity
            </button>
        </motion.div>
    );
}
