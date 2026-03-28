import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, RefreshCw, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <div className="col-12 col-md-6 col-lg-3">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card-premium p-4 h-100"
            style={{ 
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
        >
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</h2>
                    <p className="text-muted small fw-semibold text-uppercase tracking-wider mb-0">{title}</p>
                </div>
                <div className={`p-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm ${color}`} 
                     style={{ 
                         width: '56px', 
                         height: '56px',
                         border: '1px solid rgba(255, 255, 255, 0.5)',
                         boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2)'
                     }}>
                    <Icon size={26} />
                </div>
            </div>
        </motion.div>
    </div>
);

export default function StatsSection({ stats }) {
    if (!stats) return null;

    const data = [
        { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'bg-primary bg-opacity-10 text-primary' },
        { title: 'Pending Issues', value: stats.pending, icon: Clock, color: 'bg-warning bg-opacity-10 text-warning' },
        { title: 'In Progress', value: stats.inProgress, icon: RefreshCw, color: 'bg-info bg-opacity-10 text-info' },
        { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-success bg-opacity-10 text-success' },
    ];

    return (
        <div className="row g-4 mb-4">
            {data.map((item, index) => (
                <StatCard key={index} {...item} delay={0.1 * (index + 1)} />
            ))}
        </div>
    );
}
