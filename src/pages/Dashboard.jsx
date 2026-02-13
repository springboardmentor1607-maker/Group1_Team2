import React, { useEffect, useState } from 'react';
import StatsSection from '../components/StatsSection';
import AnalyticsSection from '../components/AnalyticsSection';
import MapSection from '../components/MapSection';
import RecentActivity from '../components/RecentActivity';
import CleanlinessScore from '../components/CleanlinessScore';
import { statsData, complaintDistribution, weeklyActivity, recentActivities } from '../data/mockData';
import { Plus, List, Map as MapIcon } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back, Citizen!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening in your neighborhood today.</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Report Issue
                    </button>
                </div>
            </div>

            <StatsSection stats={statsData} />

            <AnalyticsSection distribution={complaintDistribution} weekly={weeklyActivity} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <MapSection />
                </div>
                <div className="space-y-8">
                    <CleanlinessScore score={78} />
                    <RecentActivity activities={recentActivities} />
                </div>
            </div>

            {/* Quick Actions Mobile/Bottom */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-3 gap-4 lg:hidden"
            >
                <button className="p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                    <div className="mx-auto w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                        <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View All</span>
                </button>
                <button className="p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                    <div className="mx-auto w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
                        <MapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Map View</span>
                </button>
                <button className="p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                    <div className="mx-auto w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-2">
                        <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Report</span>
                </button>
            </motion.div>
        </div>
    );
}
