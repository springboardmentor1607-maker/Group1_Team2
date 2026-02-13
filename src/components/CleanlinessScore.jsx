import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    // Responsive sizing
    const responsiveSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : size;
    const responsiveStrokeWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : strokeWidth;
    const responsiveRadius = (responsiveSize - responsiveStrokeWidth) / 2;

    return (
        <div className="relative flex items-center justify-center" style={{ width: responsiveSize, height: responsiveSize }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="text-primary-500"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Clean</span>
            </div>
        </div>
    );
};

export default function CleanlinessScore({ score }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center"
        >
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 self-start">Cleanliness Score</h3>
            <CircularProgress value={score} />
            <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Based on resolved complaints vs total reports in your area.
            </p>
        </motion.div>
    );
}
