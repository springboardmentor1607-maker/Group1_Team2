import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import Skeleton from '../components/Skeleton';
import { MapPin, FileText, Send, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import MapSection from '../components/MapSection';
import { useToast } from '../context/ToastContext';

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
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas compression failed'));
                const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                resolve(compressed);
            }, 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = objectUrl;
    });
};

const ReportIssue = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        priority: '',
        address: '',
        landmark: '',
        description: '',
        latitude: null,
        longitude: null,
        photo: null, 
        location: '', 
        state: ''
    });

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        setLoading(false);
    }, []);

    // Unsaved changes guard
    useEffect(() => {
        const isDirty = formData.title || formData.description || formData.address;
        const handleBeforeUnload = (e) => {
            if (isDirty && !isSuccess) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [formData, isSuccess]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
                const reader = new FileReader();
                reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
                reader.readAsDataURL(file);
            } catch (err) { console.error(err); }
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser.', 'error');
            return;
        }
        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Location detected: ${latitude}, ${longitude}`);
                try {
                    const response = await api.get(`/zones/reverse-geocode?lat=${latitude}&lon=${longitude}`);
                    if (response.success) {
                        setFormData(prev => ({
                            ...prev,
                            latitude,
                            longitude,
                            location: response.zone || '',
                            state: response.state || '',
                            address: response.address || ''
                        }));
                    } else {
                        throw new Error(response.message || 'Geocoding failed');
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                    setFormData(prev => ({ ...prev, latitude, longitude }));
                    showToast(`Location detected but address could not be fetched`, 'warning');
                } finally {
                    setIsDetecting(false);
                }
            },
            (error) => {
                // If high accuracy fails with Code 2, try low accuracy
                if (error.code === error.POSITION_UNAVAILABLE) {
                    console.warn('High accuracy failed, retrying with low accuracy...');
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                             const { latitude, longitude } = pos.coords;
                             try {
                                 const res = await api.get(`/zones/reverse-geocode?lat=${latitude}&lon=${longitude}`);
                                 if (res.success) {
                                     setFormData(prev => ({
                                         ...prev,
                                         latitude, longitude,
                                         location: res.zone || '',
                                         state: res.state || '',
                                         address: res.address || ''
                                     }));
                                 }
                             } catch (err) {
                                 setFormData(prev => ({ ...prev, latitude, longitude }));
                             } finally {
                                 setIsDetecting(false);
                             }
                        },
                        (err2) => {
                            setIsDetecting(false);
                            showToast("Location services are currently unavailable. Please click the map manually.", "warning");
                        },
                        { timeout: 10000, enableHighAccuracy: false }
                    );
                } else {
                    setIsDetecting(false);
                    let msg = 'Unknown location error';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            msg = "User denied the request for Geolocation. Please enable it in browser settings.";
                            break;
                        case error.TIMEOUT:
                            msg = "The request to get user location timed out.";
                            break;
                    }
                    showToast(msg, 'error');
                }
            },
            { timeout: 15000, enableHighAccuracy: true }
        );
    };

    const geocodeAddress = async () => {
        if (!formData.address) {
            showToast('Please enter an address first.', 'warning');
            return;
        }
        setIsDetecting(true);
        try {
            const response = await api.get(`/zones/geocode?address=${encodeURIComponent(formData.address)}`);
            if (response.success) {
                setFormData(prev => ({
                    ...prev,
                    latitude: response.lat,
                    longitude: response.lon,
                    // We don't automatically update zone here to allow manual refinement, 
                    // but we could call reverse geocode to be sure of the zone name
                }));
                // Call reverse geocode to get the precise zone for these coordinates
                const revResponse = await api.get(`/zones/reverse-geocode?lat=${response.lat}&lon=${response.lon}`);
                if (revResponse.success) {
                    setFormData(prev => ({
                        ...prev,
                        location: revResponse.zone || prev.location,
                        state: revResponse.state || prev.state
                    }));
                }
            }
        } catch (err) {
            showToast('Could not find that address. Please try clicking the map manually.', 'warning');
        } finally {
            setIsDetecting(false);
        }
    };

    const handleLocationSelect = async (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        try {
            const response = await api.get(`/zones/reverse-geocode?lat=${lat}&lon=${lng}`);
            if (response.success) {
                setFormData(prev => ({
                    ...prev,
                    address: response.address || prev.address,
                    location: response.zone || prev.location,
                    state: response.state || prev.state
                }));
            }
        } catch (err) {
            console.error('Error fetching address for selection:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.latitude || !formData.longitude) {
            setError('Please select a location on the map');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            let finalPhotoUrl = '';
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;
                const { error: uploadError } = await supabase.storage
                    .from('complaint-images')
                    .upload(filePath, imageFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage
                    .from('complaint-images')
                    .getPublicUrl(filePath);
                finalPhotoUrl = publicUrl;
            }

            const submissionData = { ...formData, photo: finalPhotoUrl };
            await api.post('/complaints', submissionData);
            setIsSuccess(true);
            showToast('Report submitted successfully!', 'success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Submission error:', err);
            const msg = err.message || 'Failed to submit complaint. Please try again.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper className="container-lg px-3 px-md-4 py-3">
                <div className="mb-4">
                    <Skeleton width="400px" height="3.5rem" variant="title" className="mb-2" />
                    <Skeleton width="300px" height="1rem" />
                </div>
                
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-body p-4 p-md-5">
                        <div className="row g-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="col-12 col-md-6">
                                    <Skeleton width="120px" height="1rem" className="mb-2" />
                                    <Skeleton width="100%" height="2.5rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (userRole && userRole !== 'citizen') {
        return (
            <PageWrapper className="container-lg px-3 px-md-4 py-5 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card border-0 shadow-lg p-5 rounded-4 mx-auto"
                    style={{ maxWidth: '600px', background: 'var(--bg-card)' }}
                >
                    <div className="mb-4">
                        <div className="bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                            <AlertTriangle size={48} className="text-danger" />
                        </div>
                        <h2 className="fw-bold mb-3 text-danger">Access Restricted</h2>
                        <p className="text-muted fs-5">Only citizens can file complaints.</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary px-4 py-3 rounded-pill fw-bold">Go to Dashboard</button>
                </motion.div>
            </PageWrapper>
        );
    }

    if (isSuccess) {
        return (
            <PageWrapper className="container-lg px-3 px-md-4 py-5 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card border-0 shadow-lg p-5 rounded-4 mx-auto"
                    style={{ maxWidth: '600px', background: 'var(--bg-card)' }}
                >
                    <div className="mb-4">
                        <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                            <Send size={48} className="text-success" />
                        </div>
                        <h2 className="fw-bold mb-3">Report Submitted!</h2>
                        <p className="text-muted fs-5">Thank you for your report. We will look into it shortly.</p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-4">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary px-4 py-3 rounded-pill fw-bold">Go to Dashboard</button>
                        <button onClick={() => setIsSuccess(false)} className="btn btn-outline-primary px-4 py-3 rounded-pill fw-bold">Report Another</button>
                    </div>
                </motion.div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="container-lg px-3 px-md-4 py-3">
            <div>
                <div className="mb-5">
                    <h1 className="display-4 fw-bold mb-2 text-primary tracking-tight">File a Civic Report</h1>
                    <p className="text-muted fs-5">Help us build a cleaner, safer community by reporting local infrastructure or sanitation issues.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="glass-card-premium p-4 p-md-5">
                        <div className="row g-4">
                            {/* Title */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold d-flex align-items-center mb-2">
                                    <FileText size={18} className="me-2 text-primary" />
                                    Issue Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    placeholder="Brief description"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold d-flex align-items-center mb-2">
                                    <FileText size={18} className="me-2 text-primary" />
                                    Issue Type
                                </label>
                                <select
                                    name="type"
                                    className="form-select"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="pothole">Pothole</option>
                                    <option value="garbage">Garbage</option>
                                    <option value="streetlight">Street Light</option>
                                    <option value="water">Water Leakage</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold d-flex align-items-center mb-2">
                                    <AlertTriangle size={18} className="me-2 text-warning" />
                                    Priority Level
                                </label>
                                <select
                                    name="priority"
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <MapPin size={18} className="me-2 text-success" />
                                        Address
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={geocodeAddress}
                                        className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                                    >
                                        Find on Map
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    placeholder="Enter address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold d-flex align-items-center mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    className="form-control"
                                    placeholder="e.g. Kerala"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-bold d-flex justify-content-between align-items-center mb-2">
                                    <span>Area / Zone</span>
                                    <button 
                                        type="button" 
                                        onClick={detectLocation}
                                        disabled={isDetecting}
                                        className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                                    >
                                        {isDetecting ? "Detecting..." : "Detect Location"}
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    placeholder="Zone"
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold">Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Details about the issue..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold">Upload Photo</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                {formData.photo && (
                                    <div className="mt-3">
                                        <img src={formData.photo} alt="Preview" className="img-thumbnail" style={{ maxHeight: '200px' }} />
                                    </div>
                                )}
                            </div>
                            {/* Map Section */}
                            <div className="col-12 mt-2">
                                <label className="form-label fw-bold mb-3 d-flex align-items-center">
                                    <MapPin size={18} className="me-2 text-primary" />
                                    Specify Location on Map
                                </label>
                                <MapSection 
                                    onLocationSelect={handleLocationSelect} 
                                    showComplaints={false} 
                                    lat={formData.latitude} 
                                    lng={formData.longitude} 
                                    hideHeader={true}
                                    height="400px"
                                />
                                <p className="small text-muted mt-2">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Click on the map to precisely mark the issue location.
                                </p>
                            </div>

                            <div className="col-12 mt-5 text-center">
                                <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg shimmer-button" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
};

export default ReportIssue;
