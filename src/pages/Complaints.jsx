import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import StatsSection from '../components/StatsSection';
import { MapPin, Clock, User, AlertTriangle, CheckCircle, RefreshCw, Filter, Users } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import ComplaintCard from '../components/ComplaintCard';
import Skeleton from '../components/Skeleton';

function Complaints() {
    const navigate = useNavigate();
    const location = useLocation();
    const [complaints, setComplaints] = React.useState([]);
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [viewMode, setViewMode] = React.useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') === 'my' ? 'my' : 'all';
    });
    const [pagination, setPagination] = React.useState({ page: 1, pages: 1, total: 0 });

    // Check URL parameters for view mode
    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const view = searchParams.get('view');
        if (view === 'my') {
            setViewMode('my');
        } else {
            setViewMode('all');
        }
        // Reset pagination when view mode changes from URL
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [location.search]);

    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Use cached stats if fresh (< 5 min old) to avoid redundant API calls
                const STATS_TTL_MS = 5 * 60 * 1000;
                const cachedRaw = sessionStorage.getItem('complaintsStats');
                let statsData = null;

                if (cachedRaw) {
                    const cached = JSON.parse(cachedRaw);
                    if (Date.now() - cached.timestamp < STATS_TTL_MS) {
                        statsData = cached.stats;
                    }
                }

                const profileRes = await api.get('/auth/profile');

                if (!statsData) {
                    const statsRes = await api.get('/complaints/stats');
                    statsData = {
                        total: statsRes.stats?.total || 0,
                        pending: statsRes.stats?.pending || 0,
                        inProgress: statsRes.stats?.in_progress || 0,
                        resolved: statsRes.stats?.resolved || 0
                    };
                    sessionStorage.setItem('complaintsStats', JSON.stringify({ stats: statsData, timestamp: Date.now() }));
                }

                setStats(statsData);
                setUser(profileRes.user);
            } catch (err) {
                console.error('Error fetching initial page data:', err);
            }
        };
        fetchInitialData();
    }, []);

    React.useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setLoading(true);
                const complaintsEndpoint = viewMode === 'my' ? '/complaints/my-complaints' : '/complaints';
                const res = await api.get(`${complaintsEndpoint}?page=1&limit=10`);
                setComplaints(res.data || []);
                setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
            } catch (err) {
                console.error('Error fetching complaints:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();

        // Auto-refresh every 3 minutes — only when tab is visible
        const interval = setInterval(() => {
            if (document.visibilityState === 'hidden') return;

            const fetchWithoutLoading = async () => {
                try {
                    const complaintsEndpoint = viewMode === 'my' ? '/complaints/my-complaints' : '/complaints';
                    const [complaintsRes, statsRes] = await Promise.all([
                        api.get(`${complaintsEndpoint}?page=1&limit=10`),
                        api.get('/complaints/stats')
                    ]);

                    // Only update if we are on the first page
                    setPagination(prev => {
                        if (prev.page === 1) {
                            setComplaints(complaintsRes.data || []);
                            return complaintsRes.pagination || prev;
                        }
                        return prev;
                    });

                    const freshStats = {
                        total: statsRes.stats?.total || 0,
                        pending: statsRes.stats?.pending || 0,
                        inProgress: statsRes.stats?.in_progress || 0,
                        resolved: statsRes.stats?.resolved || 0
                    };
                    setStats(freshStats);
                    // Keep cache fresh
                    sessionStorage.setItem('complaintsStats', JSON.stringify({ stats: freshStats, timestamp: Date.now() }));
                } catch (err) {
                    console.error('Error refreshing complaints:', err);
                }
            };
            fetchWithoutLoading();
        }, 180_000); // 3 minutes

        return () => clearInterval(interval);
    }, [viewMode]);

    const handleLoadMore = async () => {
        if (loadingMore || pagination.page >= pagination.pages) return;

        try {
            setLoadingMore(true);
            const nextPage = pagination.page + 1;
            const complaintsEndpoint = viewMode === 'my' ? '/complaints/my-complaints' : '/complaints';
            const res = await api.get(`${complaintsEndpoint}?page=${nextPage}&limit=10`);
            
            setComplaints(prev => [...prev, ...(res.data || [])]);
            setPagination(res.pagination || { ...pagination, page: nextPage });
        } catch (err) {
            console.error('Error loading more complaints:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        const searchParams = new URLSearchParams();
        if (mode === 'my') {
            searchParams.set('view', 'my');
        }
        navigate(`/complaints${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
    };

    const handleDeleteComplaint = async (complaintId) => {
        try {
            await api.delete(`/complaints/${complaintId}`);
            // Filter it out of the UI
            setComplaints(prev => prev.filter(c => c.id !== complaintId));
            // Update stats optimally if we are in 'my' view and don't want to refetch
            setStats(prev => ({
                ...prev,
                total: prev.total - 1
            }));
        } catch (err) {
            console.error('Error deleting complaint:', err);
            alert('Failed to delete complaint: ' + (err.message || 'Unknown error'));
        }
    };

    if (loading) {
        return (
            <PageWrapper className="complaints-page container-lg px-3 px-md-4 py-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <Skeleton width="300px" height="3rem" variant="title" />
                        <Skeleton width="200px" height="1rem" />
                    </div>
                    <div className="d-flex gap-2">
                        <Skeleton width="100px" height="2.5rem" />
                        <Skeleton width="100px" height="2.5rem" />
                        <Skeleton width="150px" height="2.5rem" />
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="col-12 col-md-3">
                            <div className="skeleton-card" style={{ height: '120px' }}>
                                <Skeleton width="40%" height="0.8rem" className="mb-2" />
                                <Skeleton width="80%" height="1.5rem" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="col-12 col-lg-6">
                            <div className="skeleton-card" style={{ height: '350px' }}>
                                <div className="d-flex justify-content-between mb-3">
                                    <Skeleton width="80px" height="24px" />
                                    <Skeleton width="100px" height="24px" />
                                </div>
                                <Skeleton width="60%" height="1.5rem" className="mb-3" />
                                <div className="d-flex gap-2 mb-3">
                                    <Skeleton width="60px" height="16px" />
                                    <Skeleton width="100px" height="16px" />
                                </div>
                                <Skeleton width="100%" height="80px" className="mb-3" />
                                <div className="d-flex gap-2">
                                    <Skeleton variant="circle" width="32px" height="32px" />
                                    <Skeleton variant="circle" width="32px" height="32px" />
                                    <Skeleton variant="circle" width="32px" height="32px" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="complaints-page container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h1 className="display-5 fw-bold mb-2" style={{
                            background: 'var(--primary-color)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {viewMode === 'my' ? (
                                <><User className="me-3" size={48} />My Complaints</>
                            ) : (
                                <><Users className="me-3" size={48} />All Community Complaints</>
                            )}
                        </h1>
                        <p className="text-muted mb-0">
                            {viewMode === 'my'
                                ? 'Track your reported issues and their status'
                                : 'View and track all reported issues in your community'
                            }
                        </p>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                        {/* View Mode Toggle */}
                        <div className="btn-group" role="group" aria-label="View Mode">
                            <button
                                onClick={() => handleViewModeChange('all')}
                                className={`btn ${viewMode === 'all' ? 'btn-primary text-white' : 'btn-outline-primary border-primary'} rounded-start d-flex align-items-center justify-content-center`}
                                style={viewMode !== 'all' ? { color: 'var(--text-primary)' } : {}}
                            >
                                <Users size={16} className="me-2" />All
                            </button>
                            <button
                                onClick={() => handleViewModeChange('my')}
                                className={`btn ${viewMode === 'my' ? 'btn-primary text-white' : 'btn-outline-primary border-primary'} rounded-end d-flex align-items-center justify-content-center`}
                                style={viewMode !== 'my' ? { color: 'var(--text-primary)' } : {}}
                            >
                                <User size={16} className="me-2" />My Issues
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/report-issue')}
                            className="btn btn-success rounded-3 px-4 py-2"
                        >
                            <AlertTriangle size={18} className="me-2" />Report New Issue
                        </button>
                    </div>
                </div>

                {/* Show stats only for all complaints view */}
                {viewMode === 'all' && <StatsSection stats={stats} />}

                {/* Complaints Count */}
                <div className="mb-3">
                    <p className="text-muted mb-0">
                        Showing {complaints.length} {viewMode === 'my' ? 'of your' : 'total'} complaint{complaints.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Complaints Grid */}
                <div className="row g-4">
                    {complaints.length === 0 ? (
                        <div className="col-12">
                            <div className="text-center py-5">
                                <AlertTriangle size={64} className="text-muted mb-3" />
                                <h4 className="text-muted">
                                    {viewMode === 'my' ? 'No complaints filed yet' : 'No complaints reported yet'}
                                </h4>
                                <p className="text-muted">
                                    {viewMode === 'my'
                                        ? 'You haven\'t filed any complaints yet. Click "Report New Issue" to get started.'
                                        : 'No community complaints have been reported yet.'
                                    }
                                </p>
                                <button
                                    onClick={() => navigate('/report-issue')}
                                    className="btn btn-primary rounded-3 px-4 py-2 mt-3"
                                >
                                    <AlertTriangle size={18} className="me-2" />Report Your First Issue
                                </button>
                            </div>
                        </div>
                    ) : (
                        complaints.map((complaint, index) => (
                            <div key={complaint.id} className="col-12 col-lg-6">
                                <ComplaintCard 
                                    complaint={complaint} 
                                    viewMode={viewMode} 
                                    index={index} 
                                    onDelete={handleDeleteComplaint}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Load More Button */}
                {pagination.page < pagination.pages && (
                    <div className="d-flex justify-content-center mt-5 mb-4">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="btn btn-outline-primary rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2"
                        >
                            {loadingMore ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} /> Load More Complaints
                                </>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </PageWrapper>
    );
}

export default Complaints;