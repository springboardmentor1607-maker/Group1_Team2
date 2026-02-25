import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, RefreshCw, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <div className="col-12 col-md-6 col-lg-3">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="card border-0 shadow-lg p-4 rounded-xl hover-shadow-xl transition-shadow h-100"
        >
            <div className="d-flex align-items-center justify-content-between h-100">
                <div>
                    <p className="small fw-medium text-body-secondary mb-2">{title}</p>
                    <p className="fs-2 fw-bold text-body m-0">{value}</p>
                </div>
                <div className={`p-3 rounded-circle text-white ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    </div>
);

export default function StatsSection({ stats }) {
    if (!stats) return null;

    const data = [
        { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'bg-primary' },
        { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-warning' },
        { title: 'Progress', value: stats.inProgress, icon: RefreshCw, color: 'bg-info' },
        { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-success' },
    ];

    return (
        <div className="row g-4 mb-4">
            {data.map((item, index) => (
                <StatCard key={index} {...item} delay={0.1 * (index + 1)} />
            ))}
        </div>
    );
}
