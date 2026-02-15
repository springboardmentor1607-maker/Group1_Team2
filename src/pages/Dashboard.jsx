import React, { useEffect, useState } from 'react';
import StatsSection from '../components/StatsSection';
import AnalyticsSection from '../components/AnalyticsSection';
import MapSection from '../components/MapSection';
import RecentActivity from '../components/RecentActivity';
import CleanlinessScore from '../components/CleanlinessScore';
import { statsData, complaintDistribution, weeklyActivity, recentActivities } from '../data/mockData';
import { motion } from 'framer-motion';
import '../styles/Dashboard.css';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    // Simulate API fetch
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Dashboard Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="dashboard-header"
            >
                <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-8">
                        <h1 className="dashboard-title">Welcome Back, Citizen!</h1>
                        <p className="dashboard-subtitle">Here's what's happening in your neighborhood today.</p>
                    </div>
                    <div className="col-12 col-lg-4 text-lg-end">
                        <div className="d-flex gap-2 justify-content-lg-end flex-wrap">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-primary btn-action"
                            >
                                <i className="fas fa-plus me-2"></i>
                                Report Issue
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-outline-primary btn-action"
                            >
                                <i className="fas fa-map-marker-alt me-2"></i>
                                View Map
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Section */}
            <motion.section
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="dashboard-section"
            >
                <div className="section-header">
                    <h2 className="section-title">Overview Statistics</h2>
                    <p className="section-subtitle">Real-time complaint management metrics</p>
                </div>
                <StatsSection stats={statsData} />
            </motion.section>

            {/* Analytics Section */}
            <motion.section
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="dashboard-section"
            >
                <div className="section-header">
                    <h2 className="section-title">Analytics & Trends</h2>
                    <p className="section-subtitle">Data insights and complaint patterns</p>
                </div>
                <AnalyticsSection distribution={complaintDistribution} weekly={weeklyActivity} />
            </motion.section>

            {/* Main Content Grid */}
            <motion.section
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="dashboard-section"
            >
                <div className="row g-4">
                    {/* Map Section */}
                    <div className="col-12 col-xl-8">
                        <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="dashboard-card h-100"
                        >
                            <div className="card-header">
                                <h3 className="card-title">Interactive Map</h3>
                                <p className="card-subtitle">Visualize complaints by location</p>
                            </div>
                            <div className="card-body">
                                <MapSection />
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="col-12 col-xl-4">
                        <div className="dashboard-sidebar">
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="sidebar-card"
                            >
                                <CleanlinessScore score={78} />
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="sidebar-card"
                            >
                                <RecentActivity activities={recentActivities} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Quick Actions for Mobile */}
            <motion.section
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="dashboard-section d-xl-none"
            >
                <div className="section-header">
                    <h2 className="section-title">Quick Actions</h2>
                    <p className="section-subtitle">Common tasks at your fingertips</p>
                </div>
                <div className="row g-3">
                    <div className="col-6 col-md-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="quick-action-btn"
                        >
                            <div className="action-icon">
                                <i className="fas fa-list"></i>
                            </div>
                            <span>View All</span>
                        </motion.button>
                    </div>
                    <div className="col-6 col-md-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="quick-action-btn"
                        >
                            <div className="action-icon">
                                <i className="fas fa-map"></i>
                            </div>
                            <span>Map View</span>
                        </motion.button>
                    </div>
                    <div className="col-12 col-md-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="quick-action-btn primary"
                        >
                            <div className="action-icon">
                                <i className="fas fa-plus"></i>
                            </div>
                            <span>Report Issue</span>
                        </motion.button>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
