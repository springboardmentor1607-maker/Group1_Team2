import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, UserCheck, AlertTriangle, Settings, Eye, UserPlus } from 'lucide-react';
import { api } from '../lib/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [complaints, setComplaints] = useState([]);
    const [users, setUsers] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [complaintsRes, usersRes, statsRes] = await Promise.all([
                api.get('/complaints'),
                api.get('/auth/admin/users'),
                api.get('/complaints/stats')
            ]);

            console.log('Admin Data Loaded:');
            console.log('Total Users:', usersRes.users?.length || 0);
            console.log('Total Complaints:', complaintsRes.data?.length || 0);
            
            const volunteersList = usersRes.users?.filter(user => user.role === 'volunteer') || [];
            console.log('Volunteers Found:', volunteersList.length);
            console.log('Volunteer Details:', volunteersList);

            setComplaints(complaintsRes.data || []);
            setUsers(usersRes.users || []);
            setVolunteers(volunteersList);
            setStats(statsRes.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const assignVolunteer = async (complaintId, volunteerId) => {
        try {
            await api.post('/complaints/assign-volunteer', {
                complaintId,
                volunteerId
            });
            fetchAdminData(); // Refresh data
            setSelectedComplaint(null);
        } catch (err) {
            console.error('Error assigning volunteer:', err);
            alert('Failed to assign volunteer');
        }
    };

    const updateComplaintStatus = async (complaintId, status) => {
        try {
            await api.put(`/complaints/${complaintId}/status`, { status });
            fetchAdminData(); // Refresh data
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
            <div className="d-flex align-items-center justify-content-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <h1 className="display-5 fw-bold mb-2" style={{ 
                        background: 'linear-gradient(135deg, var(--primary-color), var(--accent-1))', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent' 
                    }}>
                        <Settings className="me-3" size={48} />Admin Dashboard
                    </h1>
                    <p className="text-muted">Manage complaints, users, and volunteers</p>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <FileText size={32} className="text-primary mb-2" />
                                <h3 className="fw-bold">{stats.total}</h3>
                                <p className="text-muted mb-0">Total Complaints</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <AlertTriangle size={32} className="text-warning mb-2" />
                                <h3 className="fw-bold">{stats.pending}</h3>
                                <p className="text-muted mb-0">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <Users size={32} className="text-info mb-2" />
                                <h3 className="fw-bold">{volunteers.length}</h3>
                                <p className="text-muted mb-0">Volunteers</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <UserCheck size={32} className="text-success mb-2" />
                                <h3 className="fw-bold">{stats.resolved}</h3>
                                <p className="text-muted mb-0">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow">
                            <div className="card-header bg-white">
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
                                    <div>
                                        <h5 className="mb-3">All Complaints Management</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Title</th>
                                                        <th>Type</th>
                                                        <th>Priority</th>
                                                        <th>Reporter</th>
                                                        <th>Status</th>
                                                        <th>Assign Volunteer</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {complaints.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="text-center text-muted py-4">
                                                                No complaints found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        complaints.map(complaint => (
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
                                                                    <select 
                                                                        className="form-select form-select-sm"
                                                                        value={complaint.status || 'Pending'}
                                                                        onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                                                                        style={{ minWidth: '120px' }}
                                                                    >
                                                                        <option value="Pending">Pending</option>
                                                                        <option value="In Progress">In Progress</option>
                                                                        <option value="Resolved">Resolved</option>
                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <select 
                                                                        className="form-select form-select-sm"
                                                                        value={complaint.assigned_to || ''}
                                                                        onChange={(e) => {
                                                                            if (e.target.value) {
                                                                                assignVolunteer(complaint.id, e.target.value);
                                                                            }
                                                                        }}
                                                                        style={{ minWidth: '180px' }}
                                                                    >
                                                                        <option value="">-- Select Volunteer --</option>
                                                                        {volunteers.map(volunteer => (
                                                                            <option key={volunteer.id} value={volunteer.id}>
                                                                                {volunteer.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {complaint.volunteer_name && (
                                                                        <small className="text-muted d-block mt-1">
                                                                            Current: {complaint.volunteer_name}
                                                                        </small>
                                                                    )}
                                                                </td>
                                                                <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
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
                                            <table className="table table-hover">
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
                                            <table className="table table-hover">
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

            {/* Volunteer Assignment Modal */}
            {selectedComplaint && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Volunteer</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setSelectedComplaint(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Complaint:</strong> {selectedComplaint.title}</p>
                                <p><strong>Current Status:</strong> {selectedComplaint.status || 'Pending'}</p>
                                <p><strong>Current Assignee:</strong> {selectedComplaint.volunteer_name || 'Unassigned'}</p>
                                
                                <div className="mb-3">
                                    <label className="form-label">Select Volunteer:</label>
                                    <select className="form-select" id="volunteerSelect">
                                        <option value="">-- Select Volunteer --</option>
                                        {volunteers.map(volunteer => (
                                            <option key={volunteer.id} value={volunteer.id}>
                                                {volunteer.name} ({volunteer.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedComplaint(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const select = document.getElementById('volunteerSelect');
                                        if (select.value) {
                                            assignVolunteer(selectedComplaint.id, select.value);
                                        }
                                    }}
                                >
                                    Assign Volunteer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;