import React from 'react';
import StatsSection from './StatsSection';
import AnalyticsSection from './AnalyticsSection';
import MapSection from './MapSection';
import RecentActivity from './RecentActivity';
import CleanlinessScore from './CleanlinessScore';
import { Plus, List, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CitizenDashboardView = ({ stats, activities, weeklyData, user }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* ===== TOP HEADER ROW ===== */}
            <div className="d-flex align-items-start justify-content-between mb-4">
                <div>
                    <h1 className="fw-bold apple-gradient-text display-5">
                        Welcome Back, {user ? user.name : 'Citizen'}!
                    </h1>
                    <p className="text-muted lead">Track your reports and help make your city better.</p>
                </div>
            </div>

            <StatsSection stats={stats} />

            <AnalyticsSection
                distribution={[
                    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
                    { name: 'Progress', value: stats.inProgress, color: '#3b82f6' },
                    { name: 'Resolved', value: stats.resolved, color: '#10b981' },
                ]}
                weekly={weeklyData}
            />

            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <MapSection />
                </div>
                <div className="col-lg-4 d-flex flex-column gap-4">
                    <CleanlinessScore score={Math.round((stats.resolved / (stats.total || 1)) * 100)} />
                    <RecentActivity activities={activities} />
                </div>
            </div>

            {/* ===== QUICK ACTIONS (MOBILE) ===== */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="row row-cols-3 g-3 d-lg-none"
            >
                <div>
                    <button 
                        onClick={() => navigate('/complaints')}
                        className="btn btn-white w-100 h-100 p-3 shadow-sm rounded-xl"
                    >
                        <div className="mx-auto bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                            <List size={20} className="text-primary" />
                        </div>
                        <span className="small fw-medium text-body-secondary">
                            View All
                        </span>
                    </button>
                </div>

                <div>
                    <button className="btn btn-white w-100 h-100 p-3 shadow-sm rounded-xl">
                        <div className="mx-auto bg-success-subtle rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                            <MapIcon size={20} className="text-success" />
                        </div>
                        <span className="small fw-medium text-body-secondary">
                            Map View
                        </span>
                    </button>
                </div>

                {user?.role === 'citizen' && (
                    <div>
                        <button 
                            onClick={() => navigate('/report-issue')}
                            className="btn btn-white w-100 h-100 p-3 shadow-sm rounded-xl"
                        >
                            <div className="mx-auto bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                                <Plus size={20} className="text-primary" />
                            </div>
                            <span className="small fw-medium text-body-secondary">
                                Report
                            </span>
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default CitizenDashboardView;
