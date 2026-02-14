import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, RefreshCw, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </motion.div>
);

export default function StatsSection({ stats }) {
    if (!stats) return null;

    const data = [
        { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'bg-blue-500', delay: 0.1 },
        { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500', delay: 0.2 },
        { title: 'In Progress', value: stats.inProgress, icon: RefreshCw, color: 'bg-purple-500', delay: 0.3 },
        { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-emerald-500', delay: 0.4 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {data.map((item, index) => (
                <StatCard key={index} {...item} />
            ))}
        </div>
    );
}
