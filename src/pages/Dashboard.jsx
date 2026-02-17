import React, { useEffect, useState } from 'react';
import StatsSection from '../components/StatsSection';
import AnalyticsSection from '../components/AnalyticsSection';
import MapSection from '../components/MapSection';
import RecentActivity from '../components/RecentActivity';
import CleanlinessScore from '../components/CleanlinessScore';
import {
    statsData,
    complaintDistribution,
    weeklyActivity,
    recentActivities
} from '../data/mockData';
import { Plus, List, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-xxl">

            {/* ===== TOP HEADER ROW ===== */}
            <div className="d-flex align-items-start justify-content-between mb-4">

                {/* LEFT TEXT ONLY (NO LOGO HERE) */}
                <div>
                    <h1 className="fw-bold text-body">
                        Welcome Back, Citizen!
                    </h1>
                </div>

                {/* RIGHT ACTION BUTTON */}
            </div>

            <StatsSection stats={statsData} />

            <AnalyticsSection
                distribution={complaintDistribution}
                weekly={weeklyActivity}
            />

            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <MapSection />
                </div>
                <div className="col-lg-4 d-flex flex-column gap-4">
                    <CleanlinessScore score={78} />
                    <RecentActivity activities={recentActivities} />
                </div>
            </div>

            {/* ===== QUICK ACTIONS (MOBILE) ===== */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="row row-cols-3 g-3 d-lg-none"
            >
                <div>
                    <button className="btn btn-white w-100 h-100 p-3 shadow-sm rounded-xl">
                        <div className="mx-auto w-10 h-10 bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center mb-2">
                            <List className="w-5 h-5 text-primary" />
                        </div>
                        <span className="small fw-medium text-body-secondary">
                            View All
                        </span>
                    </button>
                </div>

                <div>
                    <button className="btn btn-white w-100 h-100 p-3 shadow-sm rounded-xl">
                        <div className="mx-auto w-10 h-10 bg-success-subtle rounded-circle d-flex align-items-center justify-content-center mb-2">
                            <MapIcon className="w-5 h-5 text-success" />
                        </div>
                        <span className="small fw-medium text-body-secondary">
                            Map View
                        </span>
                    </button>
                </div>

                <div>
                    <button className="btn btn-white w-100 h-100 p-3 shadow-sm rounded-xl">
                        <div className="mx-auto w-10 h-10 bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center mb-2">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <span className="small fw-medium text-body-secondary">
                            Report
                        </span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}