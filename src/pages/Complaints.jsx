import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import StatsSection from '../components/StatsSection';
import { MapPin, Clock, User, AlertTriangle, CheckCircle, RefreshCw, Filter, Users } from 'lucide-react';
import '../styles/Complaints.css';

function Complaints() {
    const navigate = useNavigate();
    const location = useLocation();
    const [complaints, setComplaints] = React.useState([]);
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('all'); // 'all' or 'my'

    // Check URL parameters for view mode
    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const view = searchParams.get('view');
        if (view === 'my') {
            setViewMode('my');
        }
    }, [location.search]);

    React.useEffect(() => {
        const fetchPageData = async () => {
            try {
                setLoading(true);
                
                // Determine which endpoint to call based on view mode
                const complaintsEndpoint = viewMode === 'my' ? '/complaints/my-complaints' : '/complaints';
                
                const [complaintsRes, statsRes, profileRes] = await Promise.all([
                    api.get(complaintsEndpoint),
                    api.get('/complaints/stats'),
                    api.get('/auth/profile')
                ]);

                setComplaints(complaintsRes.data || []);
                setStats({
                    total: statsRes.stats?.total || 0,
                    pending: statsRes.stats?.pending || 0,
                    inProgress: statsRes.stats?.in_progress || 0,
                    resolved: statsRes.stats?.resolved || 0
                });
                setUser(profileRes.user);
            } catch (err) {
                console.error('Error fetching complaints page data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
        
        // Auto-refresh every 10 seconds to get latest updates
        const interval = setInterval(() => {
            // Don't show loading spinner on background refresh
            const fetchWithoutLoading = async () => {
                try {
                    const complaintsEndpoint = viewMode === 'my' ? '/complaints/my-complaints' : '/complaints';
                    const [complaintsRes, statsRes] = await Promise.all([
                        api.get(complaintsEndpoint),
                        api.get('/complaints/stats')
                    ]);
                    setComplaints(complaintsRes.data || []);
                    setStats({
                        total: statsRes.stats?.total || 0,
                        pending: statsRes.stats?.pending || 0,
                        inProgress: statsRes.stats?.in_progress || 0,
                        resolved: statsRes.stats?.resolved || 0
                    });
                } catch (err) {
                    console.error('Error refreshing complaints:', err);
                }
            };
            fetchWithoutLoading();
        }, 10000);
        
        return () => clearInterval(interval);
    }, [viewMode]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        const searchParams = new URLSearchParams();
        if (mode === 'my') {
            searchParams.set('view', 'my');
        }
        navigate(`/complaints${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
    };

    const getStatusBadge = (status) => {
        const s = (status || 'pending').toLowerCase();
        const statusMap = {
            'pending': 'warning',
            'progress': 'info',
            'in progress': 'info',
            'resolved': 'success',
        };
        return `badge bg-${statusMap[s] || 'warning'} rounded-pill`;
    };

    const getPriorityBadge = (priority) => {
        const p = (priority || 'medium').toLowerCase();
        const priorityMap = {
            'critical': 'bg-danger',
            'high': 'bg-warning', 
            'medium': 'bg-info',
            'low': 'bg-success'
        };
        return `badge ${priorityMap[p] || 'bg-info'} bg-opacity-
        5 text-dark small fw-normal`;
    };

    const getStatusIcon = (status) => {
        const s = (status || 'pending').toLowerCase();
        switch (s) {
            case 'resolved': return <CheckCircle size={16} className="text-success" />;
            case 'progress':
            case 'in progress': return <RefreshCw size={16} className="text-info" />;
            default: return <Clock size={16} className="text-warning" />;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="complaints-page container-lg px-3 px-md-4 py-3">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading complaints data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="complaints-page container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h1 className="display-5 fw-bold mb-2" style={{ 
                            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-1))', 
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
                                className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-start`}
                            >
                                <Users size={16} className="me-2" />All
                            </button>
                            <button
                                onClick={() => handleViewModeChange('my')}
                                className={`btn ${viewMode === 'my' ? 'btn-primary' : 'btn-outline-primary'} rounded-end`}
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
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card border-0 shadow-sm rounded-3 h-100 hover-shadow-lg"
                                    style={{ 
                                        background: 'var(--bg-card)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-primary bg-opacity-10 text-primary fs-6">
                                                    #{complaint.id}
                                                </span>
                                                <span className={getPriorityBadge(complaint.priority)}>
                                                    {complaint.priority || 'Medium'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                {getStatusIcon(complaint.status)}
                                                <span className={getStatusBadge(complaint.status)}>
                                                    {complaint.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        <h5 className="fw-bold mb-2 text-truncate">{complaint.title}</h5>
                                        
                                        <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary small">
                                                {complaint.type || 'Other'}
                                            </span>
                                            <span>•</span>
                                            <Clock size={14} />
                                            <span className="small">{formatDate(complaint.created_at)}</span>
                                        </div>

                                        {/* Show Reporter Info (only in all complaints view) */}
                                        {viewMode === 'all' && (
                                            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                                <User size={14} />
                                                <span className="small">
                                                    Reported by: {complaint.user_name || 'Unknown'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Show Volunteer Assignment */}
                                        {complaint.volunteer_name && (
                                            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                                <User size={14} />
                                                <span className="small">
                                                    Assigned to: {complaint.volunteer_name}
                                                </span>
                                            </div>
                                        )}

                                        <div className="d-flex align-items-start gap-2 mb-3">
                                            <MapPin size={14} className="text-muted mt-1 flex-shrink-0" />
                                            <div className="small text-muted">
                                                <div>{complaint.address}</div>
                                                {complaint.landmark && (
                                                    <div className="text-muted">Near: {complaint.landmark}</div>
                                                )}
                                            </div>
                                        </div>

                                        {complaint.description && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)',
                                                padding: '0.875rem 1rem',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(96, 165, 250, 0.4)',
                                                marginBottom: '1rem',
                                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
                                            }}>
                                                <p className="text-muted small mb-0" style={{ 
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: '1.6',
                                                    color: '#dc2626',
                                                    fontWeight: '500'
                                                }}>
                                                    {complaint.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Show location on map button */}
                                        {complaint.latitude && complaint.longitude && (
                                            <button 
                                                onClick={() => navigate('/map', { 
                                                    state: { 
                                                        focusLat: complaint.latitude, 
                                                        focusLng: complaint.longitude,
                                                        complaintId: complaint.id 
                                                    } 
                                                })}
                                                className="btn btn-outline-primary btn-sm rounded-pill"
                                            >
                                                <MapPin size={14} className="me-1" />
                                                View on Map
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default Complaints;