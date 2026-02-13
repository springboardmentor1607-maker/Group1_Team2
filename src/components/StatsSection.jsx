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
        className="glass-card p-6 rounded-xl shadow-2xl border border-white/20 card-hover relative overflow-hidden"
    >
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                <motion.p 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.2, type: "spring" }}
                    className="text-4xl font-bold gradient-text"
                >
                    {value}
                </motion.p>
            </div>
            <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ delay: delay + 0.3, duration: 0.8 }}
                className={`p-4 rounded-full ${color} shadow-xl relative`}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            </motion.div>
        </div>

        {/* Animated Bottom Border */}
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-1 rounded-full"
        ></motion.div>
    </motion.div>
);

export default function StatsSection({ stats }) {
    if (!stats) return null;

    const data = [
        { title: 'Total Complaints', value: stats.total, color: 'bg-blue-500', delay: 0.1 },
        { title: 'Pending', value: stats.pending, color: 'bg-amber-500', delay: 0.2 },
        { title: 'In Progress', value: stats.inProgress, color: 'bg-purple-500', delay: 0.3 },
        { title: 'Resolved', value: stats.resolved, color: 'bg-emerald-500', delay: 0.4 },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {data.map((item, index) => (
                <StatCard key={index} {...item} />
            ))}
        </div>
    );
}
