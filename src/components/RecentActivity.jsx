import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

const ActivityItem = ({ type, message, time }) => {
    const getIcon = () => {
        switch (type) {
            case 'resolved': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'new': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
            default: return <Info className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="mt-0.5">{getIcon()}</div>
            <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
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
            className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full"
        >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
            <div className="space-y-1">
                {activities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
                View All Activity
            </button>
        </motion.div>
    );
}
