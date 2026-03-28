import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, UserCheck, AlertTriangle, Settings, Eye, UserPlus, CheckCircle, Map, Download, Trash2, Edit, Plus, BarChart2 } from 'lucide-react';
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
    const [zones, setZones] = useState([]);
    const [isEditingUser, setIsEditingUser] = useState(null);
    const [isEditingZone, setIsEditingZone] = useState(null);
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [reportSummary, setReportSummary] = useState(null);
    const [showVisualReport, setShowVisualReport] = useState(false);
    const [zoneFilter, setZoneFilter] = useState('All');
    const [stateFilter, setStateFilter] = useState('All');
    const [volunteerZoneFilter, setVolunteerZoneFilter] = useState('All');
    const [volunteerStateFilter, setVolunteerStateFilter] = useState('All');
    const [volunteerReport, setVolunteerReport] = useState(null);
    const [showVolunteerReport, setShowVolunteerReport] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const reviewNeededCount = (complaints || []).filter(c => 
        (c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress') && 
        c.has_volunteer_photo
    ).length;

    useEffect(() => {
        fetchAdminData(1); // Always reset to page 1 when filters change
        setCurrentPage(1);
    }, [pageSize, zoneFilter, stateFilter]);

    useEffect(() => {
        // Auto-refresh logic - only refresh the currently loaded range
        const interval = setInterval(() => {
            const fetchRefresh = async () => {
                try {
                    const zoneQuery = zoneFilter && zoneFilter !== 'All' ? `zone_id=${zoneFilter}` : '';
                    const stateQuery = stateFilter && stateFilter !== 'All' ? `state=${stateFilter}` : '';
                    const queryStr = [zoneQuery, stateQuery].filter(Boolean).join('&');
                    const fullQuery = queryStr ? `&${queryStr}` : '';
                    
                    const [complaintsRes, usersRes, statsRes] = await Promise.all([
                        api.get(`/complaints?page=1&limit=${pageSize * currentPage}${fullQuery}`),
                        api.get('/auth/admin/users'),
                        api.get(`/complaints/stats?${queryStr}`)
                    ]);
                    setComplaints(complaintsRes.data || []);
                    setUsers(usersRes.users || []);
                    setStats(statsRes.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
                } catch (err) {
                    console.error('Error refreshing admin data:', err);
                }
            };
            fetchRefresh();
        }, 15000);

        return () => clearInterval(interval);
    }, [currentPage, pageSize, zoneFilter, stateFilter]);

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

    const fetchAdminData = async (page = 1, isLoadMore = false) => {
        try {
            if (page === 1 && !isLoadMore) setLoading(true);
            const zoneQuery = zoneFilter && zoneFilter !== 'All' ? `zone_id=${zoneFilter}` : '';
            const stateQuery = stateFilter && stateFilter !== 'All' ? `state=${stateFilter}` : '';
            const queryStr = [zoneQuery, stateQuery].filter(Boolean).join('&');
            const fullQuery = queryStr ? `&${queryStr}` : '';
            const [complaintsRes, usersRes, statsRes, zonesRes] = await Promise.all([
                api.get(`/complaints?page=${page}&limit=${pageSize}${fullQuery}`),
                api.get('/auth/admin/users'),
                api.get(`/complaints/stats?${queryStr}`),
                api.get('/zones') // Fetch all zones for the dropdowns
            ]);

            if (isLoadMore) {
                setComplaints(prev => [...prev, ...(complaintsRes.data || [])]);
            } else {
                setComplaints(complaintsRes.data || []);
            }

            setUsers(usersRes.users || []);
            const volunteersList = usersRes.users?.filter(user => user.role === 'volunteer') || [];
            setVolunteers(volunteersList);
            setStats(statsRes.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
            setZones(zonesRes.zones || []);
            
            if (complaintsRes.pagination) {
                setTotalPages(complaintsRes.pagination.pages);
                setHasMore(page < complaintsRes.pagination.pages);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchAdminData(nextPage, true);
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

    const handleDownloadCSV = async () => {
        try {
            const blob = await api.download('/reports/complaints/csv');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'complaints_report.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error('Error downloading CSV:', err);
            alert('Failed to download report');
        }
    };

    const fetchSummaryReport = async () => {
        try {
            const res = await api.get('/reports/summary');
            setReportSummary(res.report);
            setShowVisualReport(true);
        } catch (err) {
            console.error('Error fetching summary report:', err);
            alert('Failed to generate summary report');
        }
    };

    const fetchVolunteerReport = async () => {
        try {
            const res = await api.get('/reports/volunteers');
            setVolunteerReport(res.report);
            setShowVolunteerReport(true);
        } catch (err) {
            console.error('Error fetching volunteer report:', err);
            alert('Failed to generate volunteer report');
        }
    };

    const handleDownloadVolunteerCSV = async () => {
        try {
            const blob = await api.download('/reports/volunteers/csv');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'volunteer_report.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error('Error downloading Volunteer CSV:', err);
            alert('Failed to download volunteer report');
        }
    };

    const handleAddZone = async (zoneData) => {
        try {
            await api.post('/zones', zoneData);
            fetchAdminData();
            setIsAddingZone(false);
        } catch (err) {
            console.error('Error adding zone:', err);
            alert(err.response?.data?.message || 'Failed to add zone');
        }
    };

    const handleUpdateZone = async (id, zoneData) => {
        try {
            await api.put(`/zones/${id}`, zoneData);
            fetchAdminData();
            setIsEditingZone(null);
        } catch (err) {
            console.error('Error updating zone:', err);
            alert('Failed to update zone');
        }
    };

    const handleDeleteZone = async (id) => {
        if (!window.confirm('Are you sure you want to delete this zone?')) return;
        try {
            await api.delete(`/zones/${id}`);
            fetchAdminData();
        } catch (err) {
            console.error('Error deleting zone:', err);
            alert('Failed to delete zone');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/auth/admin/users/${id}`);
            fetchAdminData();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user');
        }
    };

    const handleUpdateUserByAdmin = async (userId, userData) => {
        try {
            await api.put('/auth/admin/users/update', {
                user_id: userId,
                ...userData
            });
            fetchAdminData();
            setIsEditingUser(null);
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user');
        }
    };

    const getStatusBadge = (status) => {
    if (!status) return 'secondary';
    const s = status.toLowerCase();
    const statusMap = {
        'pending': 'warning',
        'in progress': 'info',
        'in_progress': 'info',
        'resolved': 'success'
    };
    return `badge bg-${statusMap[s] || 'secondary'}`;
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
                                        <button
                                            className={`nav-link ${activeTab === 'zones' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('zones')}
                                        >
                                            <Map size={16} className="me-2" />Zone Management
                                        </button>
                                    </div>
                                </nav>
                            </div>
                            <div className="card-body">
                                {activeTab === 'overview' && (
                                    <div className="mt-4">
                                         <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                                             <div>
                                                 <h5 className="mb-1 fw-bold">Recent Complaints Breakdown</h5>
                                                 <p className="small text-muted mb-0">Monitor and manage community reports</p>
                                             </div>
                                             
                                             <div className="d-flex flex-wrap gap-2 align-items-center bg-dark bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-25">
                                                 {/* Action Group */}
                                                 <div className="d-flex gap-2 pe-3 border-end border-secondary border-opacity-50 me-2">
                                                     <button 
                                                        className="btn btn-sm btn-outline-success border-0 d-flex align-items-center gap-1 hover-lift px-3" 
                                                        onClick={handleDownloadCSV}
                                                        title="Export to CSV"
                                                     >
                                                         <Download size={14} /> <span className="d-none d-lg-inline">Export</span>
                                                     </button>
                                                     <button 
                                                        className="btn btn-sm btn-outline-primary border-0 d-flex align-items-center gap-1 hover-lift px-3" 
                                                        onClick={fetchSummaryReport}
                                                        title="View Visual Analytics"
                                                     >
                                                         <BarChart2 size={14} /> <span className="d-none d-lg-inline">Reports</span>
                                                     </button>
                                                 </div>

                                                 {/* State Filter */}
                                                 <div className="d-flex align-items-center gap-2 me-3 ps-2">
                                                     <i className="bi bi-geo-alt text-primary opacity-75"></i>
                                                     <select 
                                                         className="form-select form-select-sm border-0 shadow-none fw-bold"
                                                         style={{ 
                                                             width: '140px', 
                                                             background: 'rgba(255,255,255,0.05)', 
                                                             color: 'inherit',
                                                             borderRadius: '6px'
                                                         }}
                                                         value={stateFilter}
                                                         onChange={(e) => {
                                                             setStateFilter(e.target.value);
                                                             setZoneFilter('All');
                                                             setCurrentPage(1);
                                                         }}
                                                     >
                                                         <option value="All" style={{ background: '#1a1a1a' }}>All States</option>
                                                         {[...new Set(zones.map(z => z.state).filter(Boolean))].sort().map(state => (
                                                             <option key={state} value={state} style={{ background: '#1a1a1a' }}>{state}</option>
                                                         ))}
                                                     </select>
                                                 </div>

                                                 {/* Zone Filter */}
                                                 <div className="d-flex align-items-center gap-2 me-3 ps-2">
                                                     <Map size={14} className="text-primary opacity-75" />
                                                     <select 
                                                         className="form-select form-select-sm border-0 shadow-none fw-bold"
                                                         style={{ 
                                                             width: '140px', 
                                                             background: 'rgba(255,255,255,0.05)', 
                                                             color: 'inherit',
                                                             borderRadius: '6px'
                                                         }}
                                                         value={zoneFilter}
                                                         onChange={(e) => {
                                                             setZoneFilter(e.target.value);
                                                             setCurrentPage(1);
                                                         }}
                                                     >
                                                         <option value="All" style={{ background: '#1a1a1a' }}>All Zones</option>
                                                         {zones
                                                             .filter(z => stateFilter === 'All' || z.state === stateFilter)
                                                             .map(zone => (
                                                             <option key={zone.id} value={zone.id} style={{ background: '#1a1a1a' }}>{zone.name}</option>
                                                         ))}
                                                     </select>
                                                 </div>

                                                 {/* Status Filter Group */}
                                                 <div className="d-flex gap-1">
                                                     {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => {
                                                         const count = status === 'All' ? stats.total : 
                                                                      status === 'Pending' ? stats.pending : 
                                                                      status === 'In Progress' ? stats.in_progress : 
                                                                      stats.resolved;
                                                         
                                                         return (
                                                             <button
                                                                 key={status}
                                                                 className={`btn btn-sm ${statusFilter === status ? 'btn-primary shadow-sm' : 'btn-link text-decoration-none text-muted'} d-flex align-items-center gap-1 px-3 hover-lift`}
                                                                 onClick={() => setStatusFilter(status)}
                                                                 style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                                             >
                                                                 {status}
                                                                 {count > 0 && (
                                                                     <span className={`badge rounded-pill ${statusFilter === status ? 'bg-white text-primary' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                                                                         {count}
                                                                     </span>
                                                                 )}
                                                                 {status === 'In Progress' && reviewNeededCount > 0 && (
                                                                     <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }} title="Ready for Review">
                                                                         {reviewNeededCount}
                                                                     </span>
                                                                 )}
                                                             </button>
                                                         );
                                                     })}
                                                 </div>
                                             </div>
                                         </div>
                                        <div className="table-responsive">
                                            <table className="table table-hover" style={{ color: 'var(--bs-body-color)' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Title</th>
                                                        <th>Type</th>
                                                        <th>Location (State/Zone)</th>
                                                        <th>Priority</th>
                                                        <th>Reporter</th>
                                                         <th>Status</th>
                                                         <th>Actions</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {complaints
                                                        .filter(c => statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase())
                                                        .length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="text-center text-muted py-4">
                                                                No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} complaints found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        complaints
                                                            .filter(c => statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase())
                                                            .map(complaint => (
                                                            <tr key={complaint.id}>
                                                                <td>
                                                                    <div style={{ maxWidth: '200px' }}>
                                                                        {complaint.title}
                                                                    </div>
                                                                </td>
                                                                <td>{complaint.type}</td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-1">
                                                                        <span className="location-badge text-truncate" style={{maxWidth: '120px'}} title={complaint.state}>{complaint.state || 'N/A'}</span>
                                                                        <span className="zone-badge text-truncate" style={{maxWidth: '120px'}} title={complaint.zone_name}>{complaint.zone_name || 'General'}</span>
                                                                    </div>
                                                                </td>
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
                                                                    <div className="d-flex flex-column gap-2">
                                                                        <button 
                                                                            className="btn btn-sm btn-outline-primary hover-lift"
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
                                        {hasMore && (
                                            <div className="d-flex justify-content-center mt-4 mb-2">
                                                <button 
                                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                                                    onClick={handleLoadMore}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus size={18} />
                                                            Load More Complaints
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
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
                                                        <th>State</th>
                                                        <th>Location (Zone)</th>
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
                                                                <td><span className="location-badge">{user.state || 'N/A'}</span></td>
                                                                <td><span className="zone-badge">{user.location || 'Not specified'}</span></td>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            style={{ width: '120px' }}
                                                                            value={user.role}
                                                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                                        >
                                                                            <option value="citizen">Citizen</option>
                                                                            <option value="volunteer">Volunteer</option>
                                                                            <option value="admin">Admin</option>
                                                                        </select>
                                                                        <button className="btn btn-sm btn-outline-info hover-lift" onClick={() => setIsEditingUser(user)}>
                                                                            <Edit size={14} />
                                                                        </button>
                                                                        <button className="btn btn-sm btn-outline-danger hover-lift" onClick={() => handleDeleteUser(user.id)}>
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
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
                                         <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div className="d-flex flex-column">
                                                <h5 className="mb-0 fw-bold">Volunteer Management ({volunteers.length} volunteers)</h5>
                                                <p className="small text-muted mb-0">Track performance and assign tasks effectively</p>
                                            </div>
                                            
                                            <div className="d-flex align-items-center gap-3">
                                                {/* Report Button */}
                                                <button 
                                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3 fw-bold border-0 shadow-none hover-lift"
                                                    onClick={fetchVolunteerReport}
                                                    style={{ background: 'rgba(13, 110, 253, 0.1)' }}
                                                >
                                                    <BarChart2 size={16} /> Volunteer Report
                                                </button>

                                                <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-25">
                                                    <i className="bi bi-geo-alt text-primary opacity-75 ms-2"></i>
                                                <select 
                                                    className="form-select form-select-sm border-0 shadow-none fw-bold"
                                                    style={{ 
                                                        width: '140px', 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        color: 'inherit',
                                                        borderRadius: '6px'
                                                    }}
                                                    value={volunteerStateFilter}
                                                    onChange={(e) => {
                                                        setVolunteerStateFilter(e.target.value);
                                                        setVolunteerZoneFilter('All');
                                                    }}
                                                >
                                                    <option value="All" style={{ background: '#1a1a1a' }}>All States</option>
                                                    {[...new Set(volunteers.map(v => v.state).filter(Boolean))].sort().map(state => (
                                                        <option key={state} value={state} style={{ background: '#1a1a1a' }}>{state}</option>
                                                    ))}
                                                </select>

                                                <Map size={14} className="text-primary opacity-75 ms-2" />
                                                <select 
                                                    className="form-select form-select-sm border-0 shadow-none fw-bold"
                                                    style={{ 
                                                        width: '160px', 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        color: 'inherit',
                                                        borderRadius: '6px'
                                                    }}
                                                    value={volunteerZoneFilter}
                                                    onChange={(e) => setVolunteerZoneFilter(e.target.value)}
                                                >
                                                    <option value="All" style={{ background: '#1a1a1a' }}>All Zones</option>
                                                    {zones
                                                        .filter(z => volunteerStateFilter === 'All' || z.state === volunteerStateFilter)
                                                        .map(zone => (
                                                            <option key={zone.id} value={zone.name} style={{ background: '#1a1a1a' }}>{zone.name}</option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                            <table className="table table-hover" style={{ color: 'var(--bs-body-color)' }}>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>State</th>
                                                        <th>Location (Zone)</th>
                                                        <th>Phone</th>
                                                        <th>Active Assignments</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                     {volunteers
                                                         .filter(v => (volunteerStateFilter === 'All' || v.state === volunteerStateFilter) && (volunteerZoneFilter === 'All' || v.location === volunteerZoneFilter))
                                                         .length === 0 ? (
                                                         <tr>
                                                             <td colSpan="6" className="text-center text-muted py-4">
                                                                 No volunteers found in the selected zone.
                                                             </td>
                                                         </tr>
                                                     ) : (
                                                         volunteers
                                                             .filter(v => (volunteerStateFilter === 'All' || v.state === volunteerStateFilter) && (volunteerZoneFilter === 'All' || v.location === volunteerZoneFilter))
                                                             .map(volunteer => {
                                                            const assignments = complaints.filter(c => c.assigned_to === volunteer.id && c.status?.toLowerCase() !== 'resolved').length;
                                                            return (
                                                                <tr key={volunteer.id}>
                                                                    <td>{volunteer.id}</td>
                                                                    <td>{volunteer.name}</td>
                                                                    <td>{volunteer.email}</td>
                                                                    <td>{volunteer.state || 'N/A'}</td>
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

                                {activeTab === 'zones' && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">Zone Management ({zones.length} zones)</h5>
                                            <button className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={() => setIsAddingZone(true)}>
                                                <Plus size={14} /> Add New Zone
                                            </button>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-hover" style={{ color: 'var(--bs-body-color)' }}>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>State</th>
                                                        <th>Name</th>
                                                        <th>Status</th>
                                                        <th>Active Issues</th>
                                                        <th>Description</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {zones.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                No zones found. Add a zone to get started.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        zones.map(zone => (
                                                            <tr key={zone.id}>
                                                                <td>{zone.id}</td>
                                                                <td><span className="badge bg-secondary opacity-75">{zone.state || 'N/A'}</span></td>
                                                                <td>{zone.name}</td>
                                                                <td>
                                                                    <span className={`badge bg-${zone.status === 'red' ? 'danger' : zone.status === 'yellow' ? 'warning text-dark' : 'success'}`}>
                                                                        {zone.status?.toUpperCase() || 'NORMAL'}
                                                                    </span>
                                                                </td>
                                                                <td>{zone.active_complaints_count || 0}</td>
                                                                <td><small>{zone.description || 'No description'}</small></td>
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        <button className="btn btn-sm btn-outline-info" onClick={() => setIsEditingZone(zone)}>
                                                                            <Edit size={14} />
                                                                        </button>
                                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteZone(zone.id)}>
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
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
            {/* User Edit Modal */}
            {isEditingUser && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)' }}>
                            <div className="modal-header border-bottom border-secondary">
                                <h5 className="modal-title">Edit User - {isEditingUser.name}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setIsEditingUser(null)}></button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleUpdateUserByAdmin(isEditingUser.id, Object.fromEntries(formData));
                            }}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Name</label>
                                        <input type="text" name="name" className="form-control" defaultValue={isEditingUser.name} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Email</label>
                                        <input type="email" name="email" className="form-control" defaultValue={isEditingUser.email} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Phone</label>
                                        <input type="text" name="phone" className="form-control" defaultValue={isEditingUser.phone} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">State</label>
                                        <input type="text" name="state" className="form-control" defaultValue={isEditingUser.state || ''} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Location (Zone)</label>
                                        <select name="location" className="form-select" defaultValue={isEditingUser.location}>
                                            <option value="">Not specified</option>
                                            {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Role</label>
                                        <select name="role" className="form-select" defaultValue={isEditingUser.role}>
                                            <option value="citizen">Citizen</option>
                                            <option value="volunteer">Volunteer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-top border-secondary">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditingUser(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone Modal (Add/Edit) */}
            {(isAddingZone || isEditingZone) && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)' }}>
                            <div className="modal-header border-bottom border-secondary">
                                <h5 className="modal-title">{isAddingZone ? 'Add New Zone' : 'Edit Zone'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => { setIsAddingZone(false); setIsEditingZone(null); }}></button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const data = Object.fromEntries(formData);
                                if (isAddingZone) handleAddZone(data);
                                else handleUpdateZone(isEditingZone.id, data);
                            }}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">State</label>
                                        <input type="text" name="state" className="form-control" defaultValue={isEditingZone?.state || ''} required placeholder="e.g. Maharashtra" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Zone Name</label>
                                        <input type="text" name="name" className="form-control" defaultValue={isEditingZone?.name || ''} required placeholder="e.g. North Sector 7" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small uppercase fw-bold">Description</label>
                                        <textarea name="description" className="form-control" rows="3" defaultValue={isEditingZone?.description || ''} placeholder="Describe the zone's boundaries or importance"></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top border-secondary">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => { setIsAddingZone(false); setIsEditingZone(null); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{isAddingZone ? 'Add Zone' : 'Update Zone'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Report Modal */}
            {showVisualReport && reportSummary && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1070 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)' }}>
                            <div className="modal-header border-bottom border-secondary">
                                <h5 className="modal-title d-flex align-items-center">
                                    <BarChart2 className="me-2 text-primary" /> Visual Insights & Analytics
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowVisualReport(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    {/* Summary Stats */}
                                    <div className="col-md-12">
                                        <div className="row g-3">
                                            {[
                                                { label: 'Total', value: reportSummary.totalComplaints, color: 'text-primary' },
                                                { label: 'Resolved', value: reportSummary.statusBreakdown.resolved, color: 'text-success' },
                                                { label: 'In Progress', value: reportSummary.statusBreakdown.in_progress, color: 'text-info' },
                                                { label: 'Pending', value: reportSummary.statusBreakdown.pending, color: 'text-warning' }
                                            ].map((s, i) => (
                                                <div key={i} className="col-md-3">
                                                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                                                        <h3 className={`fw-bold mb-0 ${s.color}`}>{s.value}</h3>
                                                        <small className="text-muted text-uppercase fw-bold">{s.label}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Breakdown by Type */}
                                    <div className="col-md-6">
                                        <div className="card h-100 border-secondary bg-transparent">
                                            <div className="card-header border-bottom border-secondary">
                                                <h6 className="mb-0">Complaints by Category</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="list-group list-group-flush">
                                                    {Object.entries(reportSummary.typeBreakdown).map(([type, count], i) => (
                                                        <div key={i} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center py-2 px-0">
                                                            <span className="text-muted">{type}</span>
                                                            <span className="badge bg-primary rounded-pill">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                     {/* Breakdown by Zone */}
                                     <div className="col-md-6">
                                         <div className="card h-100 border-secondary bg-transparent">
                                             <div className="card-header border-bottom border-secondary">
                                                 <h6 className="mb-0">Complaints by Zone</h6>
                                             </div>
                                             <div className="card-body">
                                                 <div className="list-group list-group-flush">
                                                     {reportSummary.zoneBreakdown && reportSummary.zoneBreakdown.length > 0 ? (
                                                         reportSummary.zoneBreakdown.map((z, i) => (
                                                             <div key={i} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center py-2 px-0">
                                                                 <span className="text-muted">{z.zone_name}</span>
                                                                 <span className={`badge ${z.count >= 5 ? 'bg-danger' : z.count >= 2 ? 'bg-warning text-dark' : 'bg-success'} rounded-pill`}>
                                                                     {z.count}
                                                                 </span>
                                                             </div>
                                                         ))
                                                     ) : (
                                                         <p className="text-center text-muted py-3">No zone data available</p>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                     </div>

                                    {/* Weekly Trend */}
                                    <div className="col-md-6">
                                        <div className="card h-100 border-secondary bg-transparent">
                                            <div className="card-header border-bottom border-secondary">
                                                <h6 className="mb-0">Weekly Trend</h6>
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <p className="small text-muted mb-4">Activity over the last 7 days</p>
                                                <div className="mt-auto">
                                                    {reportSummary.weeklyStats && reportSummary.weeklyStats.length > 0 ? (
                                                        <div className="d-flex align-items-end justify-content-between h-100" style={{ height: '150px' }}>
                                                            {reportSummary.weeklyStats.map((d, i) => (
                                                                <div key={i} className="text-center" style={{ width: '12%' }}>
                                                                    <div className="bg-primary rounded-top mx-auto" style={{ 
                                                                        height: `${Math.max(10, (d.count / Math.max(...reportSummary.weeklyStats.map(w => w.count))) * 100)}px`,
                                                                        width: '20px',
                                                                        opacity: 0.8
                                                                    }}></div>
                                                                    <small className="d-block mt-2 text-muted" style={{ fontSize: '0.65rem' }}>
                                                                        {new Date(d.date).toLocaleDateString([], { weekday: 'short' })}
                                                                    </small>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-muted">No trend data available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-secondary">
                                <button className="btn btn-primary" onClick={handleDownloadCSV}>
                                    <Download size={16} className="me-2" /> Download Detailed CSV
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowVisualReport(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Volunteer Report Modal */}
            {showVolunteerReport && volunteerReport && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1080 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div className="modal-header border-bottom border-secondary py-3">
                                <h5 className="modal-title d-flex align-items-center fw-bold">
                                    <UserCheck className="me-2 text-success" /> Volunteer Performance & Impact Report
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowVolunteerReport(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                {/* Summary Stats */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="glass-card-premium p-4 h-100 d-flex align-items-center">
                                            <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
                                                <Users size={32} className="text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0">{volunteerReport.summary.total_volunteers}</h3>
                                                <p className="text-muted small text-uppercase fw-bold mb-0">Total Enrolled Volunteers</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="glass-card-premium p-4 h-100 d-flex align-items-center">
                                            <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
                                                <CheckCircle size={32} className="text-success" />
                                            </div>
                                            <div>
                                                <h3 className="fw-bold mb-0">{volunteerReport.summary.active_volunteers}</h3>
                                                <p className="text-muted small text-uppercase fw-bold mb-0">Active Volunteers (Currently Working)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    {/* Location Distribution */}
                                    <div className="col-md-4">
                                        <div className="card h-100 border-secondary bg-transparent bg-opacity-10">
                                            <div className="card-header border-bottom border-secondary bg-transparent py-3">
                                                <h6 className="mb-0 fw-bold d-flex align-items-center">
                                                    <Map size={18} className="me-2 text-info" /> Volunteer Distribution
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="list-group list-group-flush">
                                                    {volunteerReport.locationDistribution.map((loc, i) => (
                                                        <div key={i} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center py-2 px-0">
                                                            <span className="text-muted small">{loc.location}</span>
                                                            <span className="badge bg-secondary rounded-pill">{loc.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Volunteer Table */}
                                    <div className="col-md-8">
                                        <div className="card h-100 border-secondary bg-transparent bg-opacity-10">
                                            <div className="card-header border-bottom border-secondary bg-transparent py-3 d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0 fw-bold">Performance Breakdown</h6>
                                            </div>
                                            <div className="card-body p-0">
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-dark table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                                                        <thead className="bg-dark">
                                                            <tr>
                                                                <th className="ps-3 py-3">Volunteer</th>
                                                                <th className="py-3">Assignments</th>
                                                                <th className="py-3">In Progress</th>
                                                                <th className="py-3">Resolved</th>
                                                                <th className="pe-3 py-3">Efficiency</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {volunteerReport.volunteers.map(v => {
                                                                const efficiency = v.total_assigned > 0 
                                                                    ? Math.round((v.resolved_count / v.total_assigned) * 100) 
                                                                    : 0;
                                                                return (
                                                                    <tr key={v.id}>
                                                                        <td className="ps-3 py-2">
                                                                            <div className="fw-bold">{v.name}</div>
                                                                            <div className="text-muted extra-small">{v.location || 'N/A'}</div>
                                                                        </td>
                                                                        <td className="py-2">{v.total_assigned}</td>
                                                                        <td className="py-2 text-warning">{v.in_progress_count}</td>
                                                                        <td className="py-2 text-success">{v.resolved_count}</td>
                                                                        <td className="pe-3 py-2 text-end">
                                                                            <div className="progress" style={{ height: '4px', width: '60px', marginLeft: 'auto' }}>
                                                                                <div 
                                                                                    className={`progress-bar bg-${efficiency > 70 ? 'success' : efficiency > 30 ? 'warning' : 'danger'}`} 
                                                                                    style={{ width: `${efficiency}%` }}
                                                                                ></div>
                                                                            </div>
                                                                            <small className="text-muted">{efficiency}%</small>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-secondary bg-dark bg-opacity-25">
                                <button className="btn btn-outline-success d-flex align-items-center gap-2 px-4 shadow-none" onClick={handleDownloadVolunteerCSV}>
                                    <Download size={16} /> Download Full Report (CSV)
                                </button>
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowVolunteerReport(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;