import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

const ActivityItem = ({ type, message, time }) => {
    const getIcon = () => {
        switch (type) {
            case 'resolved': return <CheckCircle className="w-5 h-5 text-success" />;
            case 'new': return <AlertCircle className="w-5 h-5 text-danger" />;
            case 'in-progress': return <Clock className="w-5 h-5 text-primary" />;
            default: return <Info className="w-5 h-5 text-secondary" />;
        }
    };

    return (
        <div className="d-flex align-items-start gap-3 p-3 hover-bg-adaptive rounded transition-colors">
            <div className="mt-1">{getIcon()}</div>
            <div>
                <p className="small fw-medium text-body mb-1">{message}</p>
                <p className="small text-body-secondary m-0">{time}</p>
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
