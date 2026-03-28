import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, UserCheck, AlertTriangle, Settings, Eye, UserPlus, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import Skeleton from '../components/Skeleton';


const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [complaints, setComplaints] = useState([]);
    const [users, setUsers] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState('');
    const [modalPhotos, setModalPhotos] = useState({ photo: null, volunteer_photo: null });
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(20); // Show more items by default
    const [statusFilter, setStatusFilter] = useState('All');

    const reviewNeededCount = (complaints || []).filter(c => 
        (c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress') && 
        c.has_volunteer_photo
    ).length;

    useEffect(() => {
        fetchAdminData(currentPage);

        // Auto-refresh every 15 seconds to get latest updates
        const interval = setInterval(() => {
            // Background refresh without loading spinner
            const fetchWithoutLoading = async () => {
                try {
                    const [complaintsRes, usersRes, statsRes] = await Promise.all([
                        api.get(`/complaints?page=${currentPage}&limit=${pageSize}`),
                        api.get('/auth/admin/users'),
                        api.get('/complaints/stats')
                    ]);
                    const volunteersList = usersRes.users?.filter(user => user.role === 'volunteer') || [];
                    setComplaints(complaintsRes.data || []);
                    setUsers(usersRes.users || []);
                    setVolunteers(volunteersList);
                    setStats(statsRes.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
                    if (complaintsRes.pagination) {
                        setTotalPages(complaintsRes.pagination.pages);
                    }
                } catch (err) {
                    console.error('Error refreshing admin data:', err);
                }
            };
            fetchWithoutLoading();
        }, 60000);

        return () => clearInterval(interval);
    }, [currentPage, pageSize]);

    useEffect(() => {
        const fetchModalPhotos = async () => {
            // If the photos are already in selectedComplaint, use them
            if (selectedComplaint && (selectedComplaint.photo || selectedComplaint.volunteer_photo)) {
                setModalPhotos({
                    photo: selectedComplaint.photo || null,
                    volunteer_photo: selectedComplaint.volunteer_photo || null
                });
                return;
            }

            if (selectedComplaint && (selectedComplaint.has_photo || selectedComplaint.has_volunteer_photo)) {
                setLoadingPhotos(true);
                try {
                    const res = await api.get(`/complaints/${selectedComplaint.id}/photo`);
                    if (res && res.success && res.data) {
                        setModalPhotos({
                            photo: res.data.photo || null,
                            volunteer_photo: res.data.volunteer_photo || null
                        });
                    }
                } catch (err) {
                    console.error('Error fetching modal photos:', err);
                } finally {
                    setLoadingPhotos(false);
                }
            } else {
                setModalPhotos({ photo: null, volunteer_photo: null });
            }
        };

        fetchModalPhotos();
    }, [selectedComplaint?.id, selectedComplaint?.photo, selectedComplaint?.volunteer_photo]);

    const fetchAdminData = async (page = 1) => {
        try {
            if (page === 1) setLoading(true);
            const [complaintsRes, usersRes, statsRes] = await Promise.all([
                api.get(`/complaints?page=${page}&limit=${pageSize}`),
                api.get('/auth/admin/users'),
                api.get('/complaints/stats')
            ]);

            setComplaints(complaintsRes.data || []);
            setUsers(usersRes.users || []);
            const volunteersList = usersRes.users?.filter(user => user.role === 'volunteer') || [];
            setVolunteers(volunteersList);
            setStats(statsRes.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
            if (complaintsRes.pagination) {
                setTotalPages(complaintsRes.pagination.pages);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const assignVolunteer = async (complaintId, volunteerId) => {
    try {
        const res = await api.post('/complaints/assign-volunteer', {
            complaintId,
            volunteerId
        });
        // Refresh admin data
        fetchAdminData();
        // Update selected complaint with new volunteer info if modal is open
        if (selectedComplaint && selectedComplaint.id === complaintId) {
            const updated = res.data && res.data.data ? res.data.data : {};
            setSelectedComplaint(prev => ({
                ...prev,
                volunteer_name: updated.volunteer_name || prev.volunteer_name,
                volunteer_email: updated.volunteer_email || prev.volunteer_email,
                assigned_to: volunteerId
            }));
        }
        setIsAssigning(false);
    } catch (err) {
        console.error('Error assigning volunteer:', err);
        alert('Failed to assign volunteer');
    }
};

    const updateComplaintStatus = async (complaintId, newStatus) => {
        try {
            await api.put(`/complaints/${complaintId}/status`, { status: newStatus });
            fetchAdminData();
            setSelectedComplaint(null);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            await api.put('/auth/admin/users/role', {
                user_id: userId,
                role
            });
            fetchAdminData(); // Refresh data
        } catch (err) {
            console.error('Error updating user role:', err);
            alert('Failed to update user role');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': 'warning',
            'in progress': 'info',
            'in_progress': 'info',
            'resolved': 'success'
        };
        const badgeType = statusMap[status?.toLowerCase()] || 'warning';
        return `badge bg-${badgeType}`;
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            'critical': 'danger',
            'high': 'warning',
            'medium': 'info',
            'low': 'success'
        };
        const badgeType = priorityMap[priority?.toLowerCase()] || 'secondary';
        return `badge bg-${badgeType}`;
    };

    if (loading) {
        return (
            <PageWrapper className="container-fluid px-3 px-md-4 py-3">
                <div className="mb-4">
                    <Skeleton width="400px" height="3.5rem" variant="title" className="mb-2" />
                    <Skeleton width="300px" height="1rem" />
                </div>
                
                <div className="row g-4 mb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="col-md-3">
                            <div className="skeleton-card" style={{ height: '120px' }}>
                                <Skeleton width="32px" height="32px" variant="circle" className="mx-auto mb-2" />
                                <Skeleton width="40%" height="1.5rem" className="mx-auto mb-2" />
                                <Skeleton width="60%" height="0.8rem" className="mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-transparent border-bottom p-3">
                        <div className="d-flex gap-3">
                            <Skeleton width="150px" height="2rem" />
                            <Skeleton width="150px" height="2rem" />
                            <Skeleton width="150px" height="2rem" />
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="p-4">
                            <Skeleton width="200px" height="1.5rem" className="mb-4" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="d-flex gap-4 mb-3 pb-3 border-bottom border-light">
                                    <Skeleton width="40px" height="1rem" />
                                    <Skeleton width="200px" height="1rem" />
                                    <Skeleton width="100px" height="1rem" />
                                    <Skeleton width="80px" height="1rem" />
                                    <Skeleton width="100px" height="1rem" />
                                    <Skeleton width="100px" height="1rem" />
                                    <Skeleton width="150px" height="1.5rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <>
            <PageWrapper className="container-fluid px-3 px-md-4 py-3">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <h1 className="display-5 fw-bold mb-2 d-flex align-items-center apple-gradient-text" style={{
                        letterSpacing: '-0.03em',
                        textShadow: '0 10px 30px rgba(66, 133, 244, 0.1)'
                    }}>
                        <Settings className="me-3 text-primary opacity-90" size={40} />Admin Panel
                    </h1>
                    <p className="text-muted">Manage complaints, users, and volunteers</p>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-5">
                    {[
                        { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'text-primary', bg: 'rgba(66, 133, 244, 0.12)' },
                        { title: 'Pending', value: stats.pending, icon: AlertTriangle, color: 'text-warning', bg: 'rgba(255, 193, 7, 0.12)' },
                        { title: 'Volunteers', value: volunteers.length, icon: Users, color: 'text-info', bg: 'rgba(13, 202, 240, 0.12)' },
                        { title: 'Resolved', value: stats.resolved, icon: UserCheck, color: 'text-success', bg: 'rgba(25, 135, 84, 0.12)' }
                    ].map((item, idx) => (
                        <div className="col-md-3" key={idx}>
                            <motion.div 
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="glass-card-premium h-100"
                                style={{ 
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
                                }}
                            >
                                <div className="card-body p-4 d-flex flex-column align-items-center text-center">
                                    <div className={`p-3 rounded-circle mb-3 d-flex align-items-center justify-content-center shadow-sm`}
                                         style={{ 
                                             background: item.bg,
                                             width: '64px',
                                             height: '64px',
                                             border: '1px solid rgba(255, 255, 255, 0.6)',
                                             boxShadow: 'inset 0 0 12px rgba(255,255,255,0.4)'
                                         }}>
                                        <item.icon size={28} className={item.color} />
                                    </div>
                                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{item.value}</h2>
                                    <p className="text-muted small fw-bold text-uppercase tracking-wider mb-0" style={{ opacity: 0.8 }}>{item.title}</p>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow" style={{ background: 'var(--card-bg)' }}>
                            <div className="card-header border-bottom border-secondary" style={{ background: 'transparent' }}>
                                <nav>
                                    <div className="nav nav-tabs" role="tablist">
                                        <button
                                            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('overview')}
                                        >
                                            <FileText size={16} className="me-2" />Complaints Overview
                                        </button>
                                        <button
                                            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('users')}
                                        >
                                            <Users size={16} className="me-2" />User Management
                                        </button>
                                        <button
                                            className={`nav-link ${activeTab === 'volunteers' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('volunteers')}
                                        >
                                            <UserCheck size={16} className="me-2" />Volunteer Management
                                        </button>
                                    </div>
                                </nav>
                            </div>
                            <div className="card-body">
                                {activeTab === 'overview' && (
                                    <div className="mt-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h5 className="mb-1 fw-bold">Recent Complaints Breakdown</h5>
                                                <p className="small text-muted mb-0">Latest status from the community</p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => {
                                                    const count = status === 'All' ? stats.total : 
                                                                 status === 'Pending' ? stats.pending : 
                                                                 status === 'In Progress' ? stats.in_progress : 
                                                                 stats.resolved;
                                                    
                                                    return (
                                                        <button
                                                            key={status}
                                                            className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                                                            onClick={() => setStatusFilter(status)}
                                                        >
                                                            {status}
                                                            <span className="badge rounded-pill bg-dark bg-opacity-25" style={{ fontSize: '0.7rem' }}>
                                                                {status === 'All' ? stats.total : 
                                                                 status === 'Pending' ? stats.pending : 
                                                                 status === 'In Progress' ? stats.in_progress : 
                                                                 stats.resolved}
                                                            </span>
                                                            {status === 'In Progress' && reviewNeededCount > 0 && (
                                                                <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }} title="Ready for Review">
                                                                    {reviewNeededCount}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-hover" style={{ color: 'var(--bs-body-color)' }}>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Title</th>
                                                        <th>Type</th>
                                                        <th>Priority</th>
                                                        <th>Reporter</th>
                                                         <th>Status</th>
                                                         <th>Proof</th>
                                                         <th>Assign Volunteer</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {complaints
                                                        .filter(c => statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase())
                                                        .length === 0 ? (
                                                        <tr>
                                                            <td colSpan="9" className="text-center text-muted py-4">
                                                                No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} complaints found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        complaints
                                                            .filter(c => statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase())
                                                            .map(complaint => (
                                                            <tr key={complaint.id}>
                                                                <td>{complaint.id}</td>
                                                                <td>
                                                                    <div style={{ maxWidth: '200px' }}>
                                                                        {complaint.title}
                                                                    </div>
                                                                </td>
                                                                <td>{complaint.type}</td>
                                                                <td>
                                                                    <span className={getPriorityBadge(complaint.priority)}>
                                                                        {complaint.priority}
                                                                    </span>
                                                                </td>
                                                                <td>{complaint.user_name || 'Unknown'}</td>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className={getStatusBadge(complaint.status || 'Pending')}>
                                                                            {complaint.status || 'Pending'}
                                                                        </span>
                                                                        {(complaint.status?.toLowerCase() === 'in progress' || complaint.status?.toLowerCase() === 'in_progress') && 
                                                                         complaint.has_volunteer_photo && (
                                                                            <span className="rounded-circle bg-danger animate-pulse" 
                                                                                  style={{ width: '8px', height: '8px', boxShadow: '0 0 5px #ef4444' }}
                                                                                  title="Review Needed"
                                                                            ></span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                     {complaint.has_volunteer_photo ? (
                                                                         <span className="badge bg-info">Available</span>
                                                                     ) : (
                                                                         <span className="badge bg-secondary">None</span>
                                                                     )}
                                                                 </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-2">
                                                                        <button 
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => {
                                                                                setSelectedComplaint(complaint);
                                                                                setModalPhotos({
                                                                                    photo: complaint.photo || null,
                                                                                    volunteer_photo: complaint.volunteer_photo || null
                                                                                });
                                                                            }}
                                                                        >
                                                                            View Details & Verify
                                                                        </button>
                                                                        {complaint.volunteer_name && (
                                                                            <small className="text-muted text-center">
                                                                                Assigned: {complaint.volunteer_name}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>{new Date(complaint.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'users' && (
                                    <div>
                                        <h5 className="mb-3">User Management ({users.length} users)</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover" style={{ color: 'var(--bs-body-color)' }}>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Current Role</th>
                                                        <th>Location</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                No users found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        users.map(user => (
                                                            <tr key={user.id}>
                                                                <td>{user.id}</td>
                                                                <td>{user.name}</td>
                                                                <td>{user.email}</td>
                                                                <td>
                                                                    <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'volunteer' ? 'success' : 'primary'}`}>
                                                                        {user.role}
                                                                    </span>
                                                                </td>
                                                                <td>{user.location || 'Not specified'}</td>
                                                                <td>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={user.role}
                                                                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                                    >
                                                                        <option value="citizen">Citizen</option>
                                                                        <option value="volunteer">Volunteer</option>
                                                                        <option value="admin">Admin</option>
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'volunteers' && (
                                    <div>
                                        <h5 className="mb-3">Volunteer Management ({volunteers.length} volunteers)</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover" style={{ color: 'var(--bs-body-color)' }}>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Location</th>
                                                        <th>Phone</th>
                                                        <th>Active Assignments</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {volunteers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                No volunteers found. Users with "volunteer" role will appear here.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        volunteers.map(volunteer => {
                                                            const assignments = complaints.filter(c => c.assigned_to === volunteer.id && c.status !== 'Resolved').length;
                                                            return (
                                                                <tr key={volunteer.id}>
                                                                    <td>{volunteer.id}</td>
                                                                    <td>{volunteer.name}</td>
                                                                    <td>{volunteer.email}</td>
                                                                    <td>{volunteer.location || 'Not specified'}</td>
                                                                    <td>{volunteer.phone || 'Not provided'}</td>
                                                                    <td>
                                                                        <span className="badge bg-info">{assignments} active</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </PageWrapper>

            {/* Complaint Details and Verification Modal */}
            {selectedComplaint && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)', zIndex: 1050, position: 'relative' }}>
                            <div className="modal-header border-bottom border-secondary">
                                <h5 className="modal-title">Complaint Details - #{selectedComplaint.id}</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        setSelectedComplaint(null);
                                        setIsAssigning(false);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-1">Title</h6>
                                        <p className="fw-semibold">{selectedComplaint.title}</p>
                                        
                                        <h6 className="text-muted mb-1 mt-3">Priority & Status</h6>
                                        <p>
                                            <span className={getPriorityBadge(selectedComplaint.priority)}>{selectedComplaint.priority}</span>
                                            <span className={`ms-2 ${getStatusBadge(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-1">Reporter</h6>
                                        <p>{selectedComplaint.user_name} ({selectedComplaint.user_email})</p>

                                         <h6 className="text-muted mb-1 mt-3">Address & Date</h6>
                                         <p className="mb-0">{selectedComplaint.address}</p>
                                         <small className="text-muted">
                                             {new Date(selectedComplaint.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                                             {new Date(selectedComplaint.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                         </small>
                                     </div>
                                </div>
                                <div className="mb-4">
                                    <h6 className="text-muted mb-1">Description</h6>
                                    <p className="bg-dark p-3 rounded">{selectedComplaint.description}</p>
                                </div>

                                {/* Images Comparison */}
                                <div className="row g-4 mb-4">
                                    <div className="col-md-6">
                                        <div className="card h-100 border-secondary" style={{ background: 'var(--bg-primary)' }}>
                                            <div className="card-header border-bottom border-secondary bg-transparent">
                                                <h6 className="mb-0 text-center">Original Issue (Citizen)</h6>
                                            </div>
                                            <div className="card-body text-center d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                                                {loadingPhotos ? (
                                                    <Skeleton width="100%" height="100%" />
                                                ) : modalPhotos.photo ? (
                                                    <img src={modalPhotos.photo} alt="Original Issue" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                                ) : (
                                                    <p className="text-muted mb-0">No image provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card h-100 border-secondary" style={{ background: 'var(--bg-primary)' }}>
                                            <div className="card-header border-bottom border-secondary bg-transparent">
                                                <h6 className="mb-0 text-center">Proof of Work (Volunteer)</h6>
                                            </div>
                                            <div className="card-body text-center d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                                                {loadingPhotos ? (
                                                    <Skeleton width="100%" height="100%" />
                                                ) : modalPhotos.volunteer_photo ? (
                                                    <img src={modalPhotos.volunteer_photo} alt="Proof of Work" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                                                ) : (
                                                    <p className="text-muted mb-0">No proof of work submitted yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment Section */}
                                <div className="p-3 rounded border border-secondary" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">Volunteer Assignment</h6>
                                        {!isAssigning && (
                                            <button className="btn btn-sm btn-outline-info" onClick={() => setIsAssigning(true)}>
                                                {selectedComplaint.assigned_to ? 'Change Volunteer' : 'Assign Volunteer'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!isAssigning ? (
                                        <p className="mb-0">
                                            {selectedComplaint.volunteer_name ? (
                                                <span className="text-info fw-semibold">Assigned to: {selectedComplaint.volunteer_name}</span>
                                            ) : (
                                                <span className="text-muted">Currently Unassigned</span>
                                            )}
                                        </p>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <select className="form-select" id="volunteerSelect" defaultValue={selectedComplaint.assigned_to || ''}>
                                                <option value="">-- Select Volunteer --</option>
                                                {volunteers.map(volunteer => (
                                                    <option key={volunteer.id} value={volunteer.id}>
                                                        {volunteer.name} ({volunteer.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                className="btn btn-primary text-nowrap"
                                                onClick={() => {
                                                    const select = document.getElementById('volunteerSelect');
                                                    if (select.value) {
                                                        assignVolunteer(selectedComplaint.id, select.value);
                                                    }
                                                }}
                                            >
                                                Save Assignee
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={() => setIsAssigning(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="modal-footer border-top border-secondary d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    {selectedComplaint.status?.toLowerCase() !== 'resolved' && (
                                        <button 
                                            className="btn btn-success text-nowrap d-flex align-items-center"
                                            onClick={() => updateComplaintStatus(selectedComplaint.id, 'Resolved')}
                                        >
                                            <CheckCircle size={18} className="me-2" /> Mark as Resolved
                                        </button>
                                    )}
                                </div>
                                
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setSelectedComplaint(null);
                                        setIsAssigning(false);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;