import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import Skeleton from '../components/Skeleton';
import AdminDashboardView from '../components/AdminDashboardView';
import CitizenDashboardView from '../components/CitizenDashboardView';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
    });
    const [activities, setActivities] = useState([]);
    const [systemActivity, setSystemActivity] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats and profile
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

                // Transform recent complaints into activity format for Citizen View
                const recentComplaints = statsData.recent || [];
                const formattedActivities = recentComplaints.map(complaint => {
                    const status = (complaint.status || 'Pending').toLowerCase();
                    let iconType = 'pending';
                    if (status.includes('progress')) iconType = 'progress';
                    else if (status.includes('resolved')) iconType = 'resolved';

                    return {
                        id: complaint.id,
                        type: iconType,
                        message: complaint.title || 'Untitled Issue',
                        time: complaint.created_at ? new Date(complaint.created_at).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                        }) : 'N/A',
                        statusText: complaint.status || 'Pending',
                        category: complaint.type || 'Other'
                    };
                });

                setActivities(formattedActivities);
                setSystemActivity(statsData.systemActivity || []);
                setWeeklyData(statsData.weekly || []);
                setUser(profileData.user);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setStats({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <PageWrapper className="container-xxl px-4 py-4">
                <div className="mb-5">
                    <Skeleton width="400px" height="3.5rem" variant="title" className="mb-2" />
                    <Skeleton width="300px" height="1.2rem" />
                </div>
                
                <div className="row g-4 mb-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="col-md-3">
                            <div className="skeleton-card" style={{ height: '160px' }}>
                                <Skeleton width="30%" height="1rem" className="mb-3" />
                                <Skeleton width="60%" height="2.5rem" className="mb-3" />
                                <Skeleton width="40%" height="0.8rem" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="skeleton-card" style={{ height: '400px' }}>
                             <Skeleton width="100%" height="100%" />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="skeleton-card" style={{ height: '400px' }}>
                             <Skeleton width="40%" height="1.5rem" className="mb-4" />
                             {[1, 2, 3, 4].map(i => (
                                 <div key={i} className="mb-4">
                                     <Skeleton width="100%" height="1rem" className="mb-2" />
                                     <Skeleton width="60%" height="0.8rem" />
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    const isAdmin = user?.role === 'admin';

    return (
        <PageWrapper className="container-xxl px-4 py-4 overflow-hidden">
            {isAdmin ? (
                <AdminDashboardView 
                    stats={stats} 
                    weeklyData={weeklyData} 
                    systemActivity={systemActivity}
                    user={user} 
                />
            ) : (
                <CitizenDashboardView 
                    stats={stats} 
                    activities={activities} 
                    weeklyData={weeklyData} 
                    user={user} 
                />
            )}
        </PageWrapper>
    );
}