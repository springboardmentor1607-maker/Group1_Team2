import React from 'react';
import { motion } from 'framer-motion';

const ActivityItem = ({ type, message, time }) => {
    return (
        <div className="d-flex align-items-start p-2 p-sm-3 rounded hover-bg-light">
            <div className="flex-grow-1 min-w-0">
                <p className="small fw-medium text-break mb-1">{message}</p>
                <p className="smaller text-muted">{time}</p>
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
            className="card shadow-lg border p-3 p-sm-4 h-100"
        >
            <h3 className="card-title fs-6 fs-sm-5 fw-semibold mb-3 mb-sm-4">Recent Activity</h3>
            <div className="vstack gap-1">
                {activities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </div>
            <button className="btn btn-link w-100 mt-3 mt-sm-4 py-2 text-primary small fw-medium">
                View All Activity
            </button>
        </motion.div>
    );
}
