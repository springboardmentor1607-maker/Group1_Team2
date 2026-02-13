import React, { useEffect, useState } from 'react';
import StatsSection from '../components/StatsSection';
import AnalyticsSection from '../components/AnalyticsSection';
import MapSection from '../components/MapSection';
import RecentActivity from '../components/RecentActivity';
import CleanlinessScore from '../components/CleanlinessScore';
import { statsData, complaintDistribution, weeklyActivity, recentActivities } from '../data/mockData';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    // Simulate API fetch
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto page-transition px-4 sm:px-6 lg:px-8">
            {/* Header Section with Enhanced Styling */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2">Welcome Back, Citizen!</h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Here's what's happening in your neighborhood today.</p>
                </motion.div>

                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex gap-2"
                >
                    <button className="btn-modern flex items-center px-4 sm:px-6 py-2 sm:py-3 text-white rounded-xl transition-all duration-300 shadow-lg neon-glow text-sm sm:text-base w-full sm:w-auto justify-center">
                        Report Issue
                    </button>
                </motion.div>
            </div>

            {/* Enhanced Layout with Motion */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <StatsSection stats={statsData} />
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <AnalyticsSection distribution={complaintDistribution} weekly={weeklyActivity} />
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8"
            >
                <div className="lg:col-span-2 card-hover order-1 lg:order-1">
                    <MapSection />
                </div>
                <div className="space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-2">
                    <motion.div className="card-hover" whileHover={{ scale: 1.02 }}>
                        <CleanlinessScore score={78} />
                    </motion.div>
                    <motion.div className="card-hover" whileHover={{ scale: 1.02 }}>
                        <RecentActivity activities={recentActivities} />
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions Mobile/Bottom with Enhanced Styling */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 lg:hidden"
            >
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-card p-4 sm:p-6 rounded-xl text-center border border-white/20 card-hover"
                >
                    <div className="mx-auto w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-300">View All</span>
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-card p-4 sm:p-6 rounded-xl text-center border border-white/20 card-hover"
                >
                    <div className="mx-auto w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-300">Map View</span>
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-card p-4 sm:p-6 rounded-xl text-center border border-white/20 card-hover neon-glow col-span-2 sm:col-span-1"
                >
                    <div className="mx-auto w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-300">Report</span>
                </motion.button>
            </motion.div>
        </div>
    );
}
