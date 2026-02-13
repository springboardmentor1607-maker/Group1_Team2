import React from 'react';
import { motion } from 'framer-motion';

const ActivityItem = ({ type, message, time }) => {
    return (
        <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="mt-0.5"></div>
            <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 break-words">{message}</p>
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
            className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full"
        >
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">Recent Activity</h3>
            <div className="space-y-1">
                {activities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </div>
            <button className="w-full mt-3 sm:mt-4 py-2 text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
                View All Activity
            </button>
        </motion.div>
    );
}
