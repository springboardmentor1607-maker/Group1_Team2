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
                        Welcome Back, {user ? user.name : 'Citizen'}!
                    </h1>
                </div>

                {/* RIGHT ACTION BUTTON */}
            </div>

            <StatsSection stats={stats} />

            <AnalyticsSection
                distribution={[
                    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
                    { name: 'Progress', value: stats.inProgress, color: '#3b82f6' },
                    { name: 'Resolved', value: stats.resolved, color: '#10b981' },
                ]}
                weekly={[]} // Weekly data can be implemented later
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