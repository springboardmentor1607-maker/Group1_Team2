import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import StatsSection from '../components/StatsSection';

function Complaints() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = React.useState([]);
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPageData = async () => {
            try {
                const [complaintsRes, statsRes] = await Promise.all([
                    api.get('/complaints'),
                    api.get('/complaints/stats')
                ]);

                setComplaints(complaintsRes.data);
                setStats({
                    total: statsRes.stats?.total || 0,
                    pending: statsRes.stats?.pending || 0,
                    inProgress: statsRes.stats?.in_progress || 0,
                    resolved: statsRes.stats?.resolved || 0
                });
            } catch (err) {
                console.error('Error fetching complaints page data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, []);

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

    const getStatusLabel = (status) => {
        if (!status) return 'Pending';
        if (status === 'In Progress') return 'Progress';
        return status;
    };

    const getPriorityBadge = (priority) => {
        const p = (priority || '').toLowerCase();
        const priorityMap = {
            'critical': 'danger',
            'high': 'warning',
            'medium': 'info',
            'low': 'secondary',
        };
        return `badge bg-${priorityMap[p] || 'secondary'} rounded-pill`;
    };

    return (
        <div className="container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h1 className="display-5 fw-bold mb-2" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--accent-1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            <i className="bi bi-megaphone me-3"></i>Complaints
                        </h1>
                        <p className="text-muted mb-0">Track and manage citizen complaints</p>
                    </div>
                    <button
                        onClick={() => navigate('/report-issue')}
                        className="btn btn-primary rounded-3 px-4"
                    >
                        <i className="bi bi-plus-lg me-2"></i>New Complaint
                    </button>
                </div>

                <StatsSection stats={stats} />

                <div className="card border-0 shadow-sm rounded-3" style={{ background: 'var(--bg-card)' }}>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="border-bottom">
                                        <tr>
                                            <th className="px-4 py-3">ID</th>
                                            <th className="px-4 py-3">Issue Title</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Priority</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaints.map((complaint, index) => (
                                            <motion.tr
                                                key={complaint.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <td className="px-4 py-3 fw-medium">#{complaint.id}</td>
                                                <td className="px-4 py-3 text-truncate" style={{ maxWidth: '200px' }}>{complaint.title}</td>
                                                <td className="px-4 py-3">
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                                                        {(complaint.type || 'Other').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={getStatusBadge(complaint.status)}>{getStatusLabel(complaint.status)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={getPriorityBadge(complaint.priority)}>{complaint.priority}</span>
                                                </td>
                                                <td className="px-4 py-3 text-muted" style={{ fontSize: '0.85rem' }}>{new Date(complaint.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <button className="btn btn-sm btn-outline-primary rounded-3 me-2">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-secondary rounded-3">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
export default Complaints;