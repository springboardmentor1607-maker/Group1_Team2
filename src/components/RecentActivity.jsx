import React from 'react';
import { motion } from 'framer-motion';

const ActivityItem = ({ type, message, time }) => {
    return (
        <div className="d-flex align-items-start p-2 p-sm-3 rounded" style={{ backgroundColor: 'transparent' }}
             onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-item-bg)'}
             onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
            <div className="flex-grow-1 min-w-0">
                <p className="small fw-medium text-break mb-1" style={{ color: 'var(--bs-body-color)' }}>{message}</p>
                <p className="smaller" style={{ color: 'var(--bs-secondary-color)' }}>{time}</p>
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
            className="card shadow-lg border p-4 h-100 bg-card"
        >
            <h3 className="card-title fs-5 fw-semibold mb-4 d-flex align-items-center" style={{ color: 'var(--bs-body-color)' }}>
                <i className="bi bi-clock-history me-2" style={{ fontSize: '1.2rem' }}></i>
                Recent Activity
            </h3>
            <div className="flex-grow-1 overflow-hidden">
                <div className="d-flex flex-column" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {activities.map((activity) => (
                        <ActivityItem key={activity.id} {...activity} />
                    ))}
                </div>
            </div>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: 'var(--bs-border-color)' }}>
                <button className="btn btn-outline-primary w-100 py-2 rounded-3 small fw-medium">
                    <i className="bi bi-arrow-right me-2"></i>
                    View All Activity
                </button>
            </div>
        </motion.div>
    );
}
