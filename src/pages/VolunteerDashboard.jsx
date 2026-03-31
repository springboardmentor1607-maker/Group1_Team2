import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, MapPin, Clock, CheckCircle2, AlertTriangle, User, Phone, Calendar, Navigation } from 'lucide-react';
import { api } from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import Skeleton from '../components/Skeleton';
import { supabase } from '../lib/supabaseClient';
import RoutingMap from '../components/RoutingMap';

/**
 * Compresses an image File using the Canvas API.
 * @param {File} file - Original image file
 * @param {number} maxWidth - Max width in pixels (default 800)
 * @param {number} quality - JPEG quality 0–1 (default 0.75)
 * @returns {Promise<File>} Compressed file
 */
const compressImage = (file, maxWidth = 800, quality = 0.75) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Canvas compression failed'));
                    const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                    resolve(compressed);
                },
                'image/jpeg',
                quality
            );
        };
        img.onerror = reject;
        img.src = objectUrl;
    });
};

const VolunteerDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [updating, setUpdating] = useState(null);
    const [selectedComplaintForUpdate, setSelectedComplaintForUpdate] = useState(null);
    const [volunteerPhotoInput, setVolunteerPhotoInput] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [originalPhoto, setOriginalPhoto] = useState(null);
    const [loadingModalPhoto, setLoadingModalPhoto] = useState(false);
    const [volunteerLocation, setVolunteerLocation] = useState(null);
    const [routingComplaint, setRoutingComplaint] = useState(null);


    useEffect(() => {
        fetchVolunteerComplaints();

        // Auto-refresh every 3 minutes — only when tab is visible
        const interval = setInterval(() => {
            if (document.visibilityState === 'hidden') return;
            const fetchWithoutLoading = async () => {
                try {
                    const response = await api.get('/complaints/volunteer-complaints');
                    const data = response.data || [];
                    setComplaints(data);

                    const total = data.length || 0;
                    const pending = data.filter(c => c.status?.toLowerCase() === 'pending')?.length || 0;
                    const inProgress = data.filter(c => c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress')?.length || 0;
                    const resolved = data.filter(c => c.status?.toLowerCase() === 'resolved')?.length || 0;

                    setStats({ total, pending, inProgress, resolved });
                } catch (err) {
                    console.error('Error refreshing volunteer complaints:', err);
                }
            };
            fetchWithoutLoading();
        }, 180_000); // 3 minutes

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setVolunteerLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (err) => console.error('Error tracking location:', err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const fetchVolunteerComplaints = async () => {
        setLoading(true);
        try {
            const response = await api.get('/complaints/volunteer-complaints');
            const data = response.data || [];
            setComplaints(data);

            // Calculate stats
            const total = data.length || 0;
            const pending = data.filter(c => c.status?.toLowerCase() === 'pending')?.length || 0;
            const inProgress = data.filter(c => c.status?.toLowerCase() === 'in progress' || c.status?.toLowerCase() === 'in_progress')?.length || 0;
            const resolved = data.filter(c => c.status?.toLowerCase() === 'resolved')?.length || 0;

            setStats({ total, pending, inProgress, resolved });
        } catch (err) {
            console.error('Error fetching volunteer complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (complaintId, newStatus, volunteerPhoto) => {
        setUpdating(complaintId);
        try {
            await api.put(`/complaints/${complaintId}/status`, { status: newStatus, volunteerPhoto });
            // Refresh the list
            await fetchVolunteerComplaints();
            setSelectedComplaintForUpdate(null);
            setVolunteerPhotoInput(null);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status: ' + (err.message || 'Unknown error'));
        } finally {
            setUpdating(null);
        }
    };

    const handleUpdateClick = async (complaint) => {
        setSelectedComplaintForUpdate(complaint);
        // Use photos from complaint object if available
        setVolunteerPhotoInput(complaint.volunteer_photo || null);
        
        if (complaint.photo) {
            setOriginalPhoto(complaint.photo);
            setLoadingModalPhoto(false);
        } else if (complaint.has_photo) {
            setLoadingModalPhoto(true);
            try {
                const res = await api.get(`/complaints/${complaint.id}/photo`);
                setOriginalPhoto(res.data.photo || null);
            } catch (err) {
                console.error('Error fetching modal photo:', err);
            } finally {
                setLoadingModalPhoto(false);
            }
        } else {
            setOriginalPhoto(null);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (allow up to 10MB raw — we compress it below)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size too large. Please select an image under 10MB.');
                return;
            }

            // Compress the image before upload (max 800px wide, 75% JPEG quality)
            let fileToUpload = file;
            try {
                fileToUpload = await compressImage(file);
                console.log(`Proof compressed: ${(file.size / 1024).toFixed(0)}KB → ${(fileToUpload.size / 1024).toFixed(0)}KB`);
            } catch {
                // Fall back to original file if compression fails
            }
            setImageFile(fileToUpload);

            // Preview from original (higher quality is fine for display)
            const reader = new FileReader();
            reader.onloadend = () => {
                setVolunteerPhotoInput(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaintForUpdate) return;
        if (!imageFile && !volunteerPhotoInput) {
            alert('Please select a photo to upload.');
            return;
        }

        setUpdating(selectedComplaintForUpdate.id);

        try {
            let finalPhotoUrl = ''; // Initialize as empty to prevent Base64 leakage

            // 1. Upload to Supabase Storage if a new image was selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `verification-${selectedComplaintForUpdate.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('complaint-images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                // 2. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('complaint-images')
                    .getPublicUrl(filePath);
                
                finalPhotoUrl = publicUrl;
            } else if (volunteerPhotoInput && !volunteerPhotoInput.startsWith('data:')) {
                // If it's an existing URL (not a new upload and not base64), keep it
                finalPhotoUrl = volunteerPhotoInput;
            }

            // 3. Update status in backend
            await updateStatus(selectedComplaintForUpdate.id, selectedComplaintForUpdate.status, finalPhotoUrl);
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to upload proof: ' + (err.message || 'Unknown error'));
        } finally {
            setUpdating(null);
            setImageFile(null);
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

                <div className="card border-0 shadow">
                    <div className="card-header bg-transparent border-bottom">
                        <Skeleton width="200px" height="1.5rem" />
                    </div>
                    <div className="card-body">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="d-flex gap-4 mb-3 pb-3 border-bottom border-light">
                                <Skeleton width="60px" height="1rem" />
                                <div className="flex-grow-1">
                                    <Skeleton width="40%" height="1rem" className="mb-1" />
                                    <Skeleton width="80%" height="0.8rem" />
                                </div>
                                <Skeleton width="100px" height="1.5rem" />
                                <Skeleton width="100px" height="1.5rem" />
                            </div>
                        ))}
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
                    <h1 className="display-5 fw-bold mb-2 apple-gradient-text">
                        <ClipboardList className="me-3 text-primary" size={48} />
                        Volunteer Assignments
                    </h1>
                    <p className="text-muted">Manage your assigned complaints and update progress</p>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="glass-card-premium h-100 p-4 text-center">
                                <ClipboardList size={32} className="text-primary mb-2" />
                                <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</h3>
                                <p className="text-muted mb-0">Total Assigned</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card-premium h-100 p-4 text-center">
                                <Clock size={32} className="text-warning mb-2" />
                                <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stats.pending}</h3>
                                <p className="text-muted mb-0">Pending</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card-premium h-100 p-4 text-center">
                                <AlertTriangle size={32} className="text-info mb-2" />
                                <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stats.inProgress}</h3>
                                <p className="text-muted mb-0">In Progress</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card-premium h-100 p-4 text-center">
                                <CheckCircle2 size={32} className="text-success mb-2" />
                                <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stats.resolved}</h3>
                                <p className="text-muted mb-0">Resolved</p>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mt-1">
                    <div className="col-12">
                        {/* Complaints List */}
                        <div className="card border-0 shadow h-100">
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
                                                    <th className="bg-transparent" style={{ color: 'var(--text-primary)' }}>Actions</th>
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
                                                        <td className="bg-transparent">
                                                            {getPriorityBadge(complaint.priority)}
                                                        </td>
                                                        <td className="bg-transparent text-center">
                                                            <span className={
                                                                complaint.status?.toLowerCase() === 'resolved' ? 'badge bg-success' :
                                                                (complaint.status?.toLowerCase() === 'in progress' || complaint.status?.toLowerCase() === 'in_progress') ? 'badge bg-info' : 'badge bg-warning'
                                                            }>
                                                                {complaint.status || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="bg-transparent">
                                                            <div className="d-flex flex-column gap-1">
                                                                <small className="d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                                    <User size={12} /> {complaint.user_name}
                                                                </small>
                                                                <small style={{ color: 'var(--text-muted)' }}>{complaint.user_email}</small>
                                                            </div>
                                                        </td>
                                                        <td className="bg-transparent">
                                                            <small className="d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                                <MapPin size={12} />
                                                                {complaint.address?.substring(0, 20)}...
                                                            </small>
                                                        </td>
                                                        <td className="bg-transparent">
                                                            <div className="d-flex flex-column gap-2" style={{ maxWidth: '140px' }}>
                                                                {complaint.status?.toLowerCase() !== 'resolved' ? (
                                                                    <button 
                                                                        className="btn btn-sm btn-primary w-100 py-1 shadow-sm d-flex align-items-center justify-content-center gap-1"
                                                                        onClick={() => handleUpdateClick(complaint)}
                                                                    >
                                                                        <CheckCircle2 size={14} /> Update Proof
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-success w-100 py-1 d-flex align-items-center justify-content-center gap-1"
                                                                        onClick={() => handleUpdateClick(complaint)}
                                                                    >
                                                                        <ClipboardList size={14} /> View Details
                                                                    </button>
                                                                )}
                                                                
                                                                {complaint.latitude && complaint.longitude && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-info w-100 py-1 d-flex align-items-center justify-content-center gap-1"
                                                                        onClick={() => setRoutingComplaint(complaint)}
                                                                    >
                                                                        <Navigation size={14} /> View Route
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                    
                {/* Instructions Card */}
                <div className="card border-0 shadow mt-4" style={{ background: 'var(--bg-card)' }}>
                    <div className="card-body">
                        <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Instructions:</h6>
                        <ul className="mb-0" style={{ color: 'var(--text-muted)' }}>
                            <li>Click on a complaint to upload your proof of work photo.</li>
                            <li>The administrators will verify your photo and update the complaint status to Resolved.</li>
                            <li>Dashboard statistics will update in real-time as admins approve cases.</li>
                            <li>Contact citizens using the provided phone number or email for any clarifications.</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </PageWrapper>

            {selectedComplaintForUpdate && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)' }}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title">
                                    {selectedComplaintForUpdate.status?.toLowerCase() === 'resolved' ? 'Complaint Details #' : 'Upload Proof for Complaint #'}
                                    {selectedComplaintForUpdate.id}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedComplaintForUpdate(null)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleStatusSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted">Title</label>
                                        <p className="fw-semibold mb-0" style={{ color: 'var(--text-primary)' }}>{selectedComplaintForUpdate.title}</p>
                                    </div>

                                    {selectedComplaintForUpdate.has_photo && (
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Original Issue Photo</label>
                                            <div style={{ minHeight: '100px', backgroundColor: 'var(--bg-secondary)' }} className="rounded d-flex align-items-center justify-content-center">
                                                {loadingModalPhoto ? (
                                                    <Skeleton width="100%" height="200px" />
                                                ) : originalPhoto ? (
                                                    <img 
                                                        src={originalPhoto} 
                                                        alt="Complaint Issue" 
                                                        className="img-fluid rounded" 
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span className="text-muted small">Photo unavailable</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label text-muted">Location</label>
                                        <div className="d-flex align-items-center justify-content-between gap-2">
                                            <p className="small mb-1 d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                <MapPin size={14} />
                                                {selectedComplaintForUpdate.address}
                                            </p>
                                            {selectedComplaintForUpdate.latitude && selectedComplaintForUpdate.longitude && (
                                                <button 
                                                    type="button"
                                                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1 rounded-pill px-3"
                                                    onClick={() => setRoutingComplaint(selectedComplaintForUpdate)}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    <Navigation size={12} /> View Route
                                                </button>
                                            )}
                                        </div>
                                        {selectedComplaintForUpdate.landmark && (
                                            <p className="small text-muted mb-0 ms-4">Near: {selectedComplaintForUpdate.landmark}</p>
                                        )}
                                    </div>
                                    
                                    {selectedComplaintForUpdate.status?.toLowerCase() !== 'resolved' ? (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label text-muted">Proof of Work Photo</label>
                                                <div className="input-group">
                                                    <input 
                                                        type="file" 
                                                        className="form-control text-light border-secondary" 
                                                        style={{ background: 'var(--bg-secondary)', color: 'var(--bs-body-color)' }}
                                                        accept="image/*"
                                                        capture="environment"
                                                        onChange={handlePhotoChange}
                                                    />
                                                </div>
                                                {volunteerPhotoInput && (
                                                    <div className="mt-2 text-center">
                                                        <img 
                                                            src={volunteerPhotoInput} 
                                                            alt="Preview" 
                                                            className="img-thumbnail" 
                                                            style={{ maxHeight: '150px', background: 'var(--bg-secondary)' }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="form-text text-muted" style={{ fontSize: '0.8rem' }}>
                                                    Take a photo of the completed work. The admin will verify this photo to resolve the complaint.
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end gap-2 mt-4">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary" 
                                                    onClick={() => setSelectedComplaintForUpdate(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary"
                                                    disabled={updating === selectedComplaintForUpdate.id}
                                                >
                                                    {updating === selectedComplaintForUpdate.id ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Uploading...
                                                        </>
                                                    ) : 'Upload Photo'}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {selectedComplaintForUpdate.volunteer_photo && (
                                                <div className="mb-3 mt-4 border-top pt-3">
                                                    <label className="form-label text-success fw-bold"><CheckCircle2 size={16} className="me-1" /> Submitted Proof</label>
                                                    <div className="mt-2">
                                                        <img 
                                                            src={selectedComplaintForUpdate.volunteer_photo} 
                                                            alt="Volunteer Proof" 
                                                            className="img-fluid rounded border border-success" 
                                                            style={{ maxHeight: '250px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-end gap-2 mt-4">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary" 
                                                    onClick={() => setSelectedComplaintForUpdate(null)}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {routingComplaint && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ background: 'var(--bg-primary)', color: 'var(--bs-body-color)' }}>
                            <div className="modal-header border-bottom border-light p-4">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <Navigation className="text-primary" size={24} />
                                    Navigation to Complaint #{routingComplaint.id}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setRoutingComplaint(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-1">{routingComplaint.title}</h6>
                                    <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                                        <MapPin size={14} /> {routingComplaint.address}
                                    </p>
                                </div>
                                
                                <div className="position-relative">
                                    <RoutingMap 
                                        volunteerLoc={volunteerLocation} 
                                        complaintLoc={{ lat: parseFloat(routingComplaint.latitude), lng: parseFloat(routingComplaint.longitude) }} 
                                        complaintTitle={routingComplaint.title}
                                    />
                                    
                                    {!volunteerLocation && (
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center p-4" style={{ pointerEvents: 'none' }}>
                                            <div className="bg-white p-3 rounded-pill shadow-lg border border-primary border-opacity-25 d-flex align-items-center gap-2 animate-pulse" style={{ pointerEvents: 'auto' }}>
                                                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                                                <span className="small fw-semibold">Acquiring your GPS position...</span>
                                                <button 
                                                    className="btn btn-sm btn-link p-0 text-decoration-none ms-2"
                                                    onClick={() => {
                                                        navigator.geolocation.getCurrentPosition(
                                                            (pos) => setVolunteerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                                                            (err) => alert("Please allow location access in your browser.")
                                                        );
                                                    }}
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25">
                                    <div className="d-flex gap-3 align-items-start">
                                        <Navigation className="text-primary mt-1" size={20} />
                                        <div>
                                            <p className="mb-0 fw-semibold text-primary">Live Tracking Active</p>
                                            <p className="small text-muted mb-0">The map will update your position as you move towards the complaint location.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-light p-3">
                                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setRoutingComplaint(null)}>Close Map</button>
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${routingComplaint.latitude},${routingComplaint.longitude}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-primary px-4 rounded-pill d-flex align-items-center gap-2"
                                >
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VolunteerDashboard;
