import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ 
            scale: 1.05,
            rotateY: 5,
            transition: { duration: 0.3 }
        }}
        className="card glass-card p-4 p-sm-5 rounded shadow border card-hover position-relative overflow-hidden"
    >
        {/* Background Gradient Effect */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient opacity-10 pe-none"></div>
        
        <div className="d-flex align-items-center justify-content-between position-relative">
            <div>
                <p className="small fw-medium text-muted mb-1">{title}</p>
                <motion.p 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.2, type: "spring" }}
                    className="display-4 fw-bold gradient-text"
                >
                    {value}
                </motion.p>
            </div>
            <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ delay: delay + 0.3, duration: 0.8 }}
                className={`p-3 p-sm-4 rounded-circle ${color} shadow position-relative`}
                style={{ width: '60px', height: '60px' }}
            >
                <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle bg-gradient opacity-25"></div>
            </motion.div>
        </div>

        {/* Animated Bottom Border */}
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className="position-absolute bottom-0 start-0 bg-gradient rounded"
            style={{ height: '4px' }}
        ></motion.div>
    </motion.div>
);

export default function StatsSection({ stats }) {
    if (!stats) return null;

    const data = [
        { title: 'Total Complaints', value: stats.total, color: 'bg-primary', delay: 0.1 },
        { title: 'Pending', value: stats.pending, color: 'bg-warning', delay: 0.2 },
        { title: 'In Progress', value: stats.inProgress, color: 'bg-info', delay: 0.3 },
        { title: 'Resolved', value: stats.resolved, color: 'bg-success', delay: 0.4 },
    ];

    return (
        <div className="row g-3 g-sm-4 mb-4 mb-sm-5">
            {data.map((item, index) => (
                <div key={index} className="col-12 col-sm-6 col-lg-3">
                    <StatCard {...item} />
                </div>
            ))}
        </div>
    );
}
