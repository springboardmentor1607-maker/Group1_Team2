import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, MapPin, Clock, CheckCircle2, AlertTriangle, User, Phone, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import PageWrapper from '../components/PageWrapper';

const VolunteerDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchVolunteerComplaints();

        // Auto-refresh every 10 seconds to get latest updates
        const interval = setInterval(() => {
            // Background refresh without affecting loading state
            const fetchWithoutLoading = async () => {
                try {
                    const response = await api.get('/complaints/volunteer-complaints');
                    setComplaints(response.data || []);

                    const total = response.data?.length || 0;
                    const pending = response.data?.filter(c => c.status === 'Pending')?.length || 0;
                    const inProgress = response.data?.filter(c => c.status === 'In Progress')?.length || 0;
                    const resolved = response.data?.filter(c => c.status === 'Resolved')?.length || 0;

                    setStats({ total, pending, inProgress, resolved });
                } catch (err) {
                    console.error('Error refreshing volunteer complaints:', err);
                }
            };
            fetchWithoutLoading();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchVolunteerComplaints = async () => {
        try {
            const response = await api.get('/complaints/volunteer-complaints');
            setComplaints(response.data || []);

            // Calculate stats
            const total = response.data?.length || 0;
            const pending = response.data?.filter(c => c.status === 'Pending')?.length || 0;
            const inProgress = response.data?.filter(c => c.status === 'In Progress')?.length || 0;
            const resolved = response.data?.filter(c => c.status === 'Resolved')?.length || 0;

            setStats({ total, pending, inProgress, resolved });
        } catch (err) {
            console.error('Error fetching volunteer complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (complaintId, newStatus) => {
        setUpdating(complaintId);
        try {
            await api.put(`/complaints/${complaintId}/status`, { status: newStatus });
            // Refresh the list
            await fetchVolunteerComplaints();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status: ' + (err.message || 'Unknown error'));
        } finally {
            setUpdating(null);
        }
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            'critical': 'danger',
            'high': 'warning',
            'medium': 'info',
            'low': 'success'
        };
        const badgeType = priorityMap[priority?.toLowerCase()] || 'secondary';
        return <span className={`badge bg-${badgeType}`}>{priority}</span>;
    };

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
        <PageWrapper className="container-fluid px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <h1 className="display-5 fw-bold mb-2">
                        <ClipboardList className="me-3" size={48} />
                        Volunteer Dashboard
                    </h1>
                    <p className="text-muted">Manage your assigned complaints and update progress</p>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <ClipboardList size={32} className="text-primary mb-2" />
                                <h3 className="fw-bold">{stats.total}</h3>
                                <p className="text-muted mb-0">Total Assigned</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <Clock size={32} className="text-warning mb-2" />
                                <h3 className="fw-bold">{stats.pending}</h3>
                                <p className="text-muted mb-0">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <AlertTriangle size={32} className="text-info mb-2" />
                                <h3 className="fw-bold">{stats.inProgress}</h3>
                                <p className="text-muted mb-0">In Progress</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <CheckCircle2 size={32} className="text-success mb-2" />
                                <h3 className="fw-bold">{stats.resolved}</h3>
                                <p className="text-muted mb-0">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complaints List */}
                <div className="card border-0 shadow">
                    <div className="card-header bg-transparent border-bottom border-light">
                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>Your Assigned Complaints</h5>
                    </div>
                    <div className="card-body">
                        {complaints.length === 0 ? (
                            <div className="text-center py-5">
                                <ClipboardList size={64} className="mb-3" style={{ color: 'var(--text-muted)' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No complaints assigned to you yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr style={{ color: 'var(--text-primary)' }}>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>ID</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Title</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Type</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Priority</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Status</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Citizen Info</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Location</th>
                                            <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaints.map((complaint) => (
                                            <tr key={complaint.id}>
                                                <td className="fw-bold bg-transparent" style={{ color: 'var(--text-primary)' }}>#{complaint.id}</td>
                                                <td className="bg-transparent">
                                                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{complaint.title}</div>
                                                    <small style={{ color: 'var(--text-muted)' }}>{complaint.description?.substring(0, 50)}...</small>
                                                </td>
                                                <td className="bg-transparent">
                                                    <span className="badge bg-secondary">{complaint.type}</span>
                                                </td>
                                                <td className="bg-transparent">{getPriorityBadge(complaint.priority)}</td>
                                                <td className="bg-transparent">
                                                    <select
                                                        className="form-select form-select-sm border-0 shadow-sm"
                                                        value={complaint.status || 'Pending'}
                                                        onChange={(e) => updateStatus(complaint.id, e.target.value)}
                                                        disabled={updating === complaint.id}
                                                        style={{
                                                            minWidth: '130px',
                                                            background: 'var(--bg-secondary)',
                                                            color: 'var(--text-primary)',
                                                            cursor: updating === complaint.id ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                    </select>
                                                </td>
                                                <td className="bg-transparent">
                                                    <div className="d-flex flex-column gap-1">
                                                        <small className="d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                            <User size={12} /> {complaint.user_name}
                                                        </small>
                                                        {complaint.user_phone && (
                                                            <small className="d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                                <Phone size={12} /> {complaint.user_phone}
                                                            </small>
                                                        )}
                                                        <small style={{ color: 'var(--text-muted)' }}>{complaint.user_email}</small>
                                                    </div>
                                                </td>
                                                <td className="bg-transparent">
                                                    <small className="d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                        <MapPin size={12} />
                                                        {complaint.address?.substring(0, 30)}...
                                                    </small>
                                                    {complaint.landmark && (
                                                        <small style={{ color: 'var(--text-muted)' }}>Near: {complaint.landmark}</small>
                                                    )}
                                                </td>
                                                <td className="bg-transparent">
                                                    <small className="d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                        <Calendar size={12} />
                                                        {new Date(complaint.created_at).toLocaleDateString()}
                                                    </small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions Card */}
                <div className="card border-0 shadow mt-4" style={{ background: 'var(--bg-card)' }}>
                    <div className="card-body">
                        <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Instructions:</h6>
                        <ul className="mb-0" style={{ color: 'var(--text-muted)' }}>
                            <li>Use the status dropdown to update complaint progress: Pending → In Progress → Resolved</li>
                            <li>Dashboard statistics will update in real-time as you change complaint statuses</li>
                            <li>Contact citizens using the provided phone number or email for any clarifications</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </PageWrapper>
    );
};

export default VolunteerDashboard;
