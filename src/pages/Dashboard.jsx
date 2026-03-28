import React, { useEffect, useState } from 'react';
import StatsSection from '../components/StatsSection';
import AnalyticsSection from '../components/AnalyticsSection';
import MapSection from '../components/MapSection';
import RecentActivity from '../components/RecentActivity';
import CleanlinessScore from '../components/CleanlinessScore';
import { Plus, List, Map as MapIcon, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import Skeleton from '../components/Skeleton';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
    });
    const [activities, setActivities] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats and recent complaints
                const [statsData, profileData] = await Promise.all([
                    api.get('/complaints/stats'),
                    api.get('/auth/profile')
                ]);

                setStats({
                    total: statsData.stats?.total || 0,
                    pending: statsData.stats?.pending || 0,
                    inProgress: statsData.stats?.in_progress || 0,
                    resolved: statsData.stats?.resolved || 0
                });

                // Transform recent complaints into activity format
                const recentComplaints = statsData.recent || [];
                const formattedActivities = recentComplaints.map(complaint => ({
                    id: complaint.id,
                    type: complaint.status?.toLowerCase() || 'pending',
                    message: complaint.title,
                    time: new Date(complaint.created_at).toLocaleDateString(),
                    statusText: complaint.status || 'Pending',
                    category: complaint.type
                }));

                setActivities(formattedActivities);
                setWeeklyData(statsData.weekly || []);
                setUser(profileData.user);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                // Set fallback data instead of leaving empty
                setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Auto-refresh every 10 seconds to get latest updates
        const interval = setInterval(fetchDashboardData, 10000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <PageWrapper className="container-xxl">
                <div className="d-flex align-items-start justify-content-between mb-4">
                    <Skeleton width="40%" height="2.5rem" variant="title" />
                </div>
                
                {/* Stats Section Skeleton */}
                <div className="row g-4 mb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="col-12 col-md-6 col-lg-3">
                            <div className="skeleton-card" style={{ height: '140px' }}>
                                <Skeleton width="30%" height="1rem" className="mb-2" />
                                <Skeleton width="60%" height="2rem" className="mb-2" />
                                <Skeleton width="40%" height="0.8rem" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area Skeletons */}
                <div className="row g-4 mb-4">
                    <div className="col-lg-8">
                        <div className="skeleton-card" style={{ height: '400px' }}>
                            <Skeleton width="100%" height="100%" />
                        </div>
                    </div>
                    <div className="col-lg-4 d-flex flex-column gap-4">
                        <div className="skeleton-card" style={{ height: '150px' }}>
                            <Skeleton width="40%" height="1rem" className="mb-3" />
                            <Skeleton variant="circle" width="80px" height="80px" className="mx-auto" />
                        </div>
                        <div className="skeleton-card" style={{ height: '226px' }}>
                            <Skeleton width="40%" height="1rem" className="mb-3" />
                            {[1, 2, 3].map(i => (
                                <div key={i} className="d-flex gap-2 mb-3">
                                    <Skeleton variant="circle" width="40px" height="40px" />
                                    <div className="flex-grow-1">
                                        <Skeleton width="80%" height="0.8rem" className="mb-2" />
                                        <Skeleton width="40%" height="0.6rem" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="container-xxl px-4 py-4">
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
                    <RecentActivity activities={(activities || []).map(a => {
                        let statusText = (a.status || 'Pending');
                        if (statusText === 'In Progress') statusText = 'Progress';

                        return {
                            id: a.id,
                            type: statusText.toLowerCase().replace(' ', '-'),
                            statusText: statusText,
                            category: a.type || 'Other',
                            message: a.title || 'Untitled Issue',
                            time: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'
                        };
                    })} />
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
        </motion.div>
    </PageWrapper>
);
}