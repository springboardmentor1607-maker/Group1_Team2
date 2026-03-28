import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileVolume2, AlertTriangle, Send, Map as MapIcon, Info, Plus, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapSection from '../components/MapSection';
import { api } from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import Skeleton from '../components/Skeleton';
import { supabase } from '../lib/supabaseClient';

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

const ReportIssue = () => {
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        priority: '',
        address: '',
        landmark: '',
        description: '',
        latitude: null,
        longitude: null,
        photo: null // Base64 string of the image
    });

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <PageWrapper className="container-lg px-3 px-md-4 py-3">
                <div className="mb-4">
                    <Skeleton width="400px" height="3.5rem" variant="title" className="mb-2" />
                    <Skeleton width="300px" height="1rem" />
                </div>
                
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-body p-4 p-md-5">
                        <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
                            <Skeleton width="32px" height="32px" variant="circle" className="me-3" />
                            <Skeleton width="200px" height="1.8rem" />
                        </div>
                        <div className="row g-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="col-12 col-md-6">
                                    <Skeleton width="120px" height="1rem" className="mb-2" />
                                    <Skeleton width="100%" height="2.5rem" />
                                </div>
                            ))}
                            <div className="col-12">
                                <Skeleton width="120px" height="1rem" className="mb-2" />
                                <Skeleton width="100%" height="8rem" />
                            </div>
                            <div className="col-12">
                                <Skeleton width="200px" height="1.5rem" className="mb-3" />
                                <Skeleton width="100%" height="300px" />
                            </div>
                            <div className="col-12 text-center mt-5">
                                <Skeleton width="200px" height="3.5rem" className="mx-auto" />
                            </div>
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
                            <Ban size={48} className="text-danger" />
                        </div>
                        <h2 className="fw-bold mb-3 text-danger">Access Restricted</h2>
                        <p className="text-muted fs-5">
                            Only citizens can file complaints. {userRole === 'volunteer' ? 'As a volunteer, you can view and update assigned complaints from your dashboard.' : 'As an admin, you can manage complaints from the admin dashboard.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(userRole === 'admin' ? '/admin' : '/dashboard')}
                        className="btn btn-primary px-4 py-3 rounded-pill fw-bold"
                    >
                        Go to Dashboard
                    </button>
                </motion.div>
            </PageWrapper>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (e.g., max 10MB raw — we compress it below)
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size should be less than 10MB');
                e.target.value = ''; // Reset input
                return;
            }

            // Compress the image before upload (max 800px wide, 75% JPEG quality)
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
                console.log(`Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
            } catch {
                // Fall back to original file if compression fails
                setImageFile(file);
            }

            // Show preview from original file (higher quality preview is fine)
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result }));
                setError(''); // Clear any previous errors
            };
            reader.readAsDataURL(file);
        }
    };


    const handleLocationSelect = (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
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

            // 1. Upload to Supabase Storage if an image was selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
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
            }

            // 3. Submit to backend with public URL
            const submissionData = {
                ...formData,
                photo: finalPhotoUrl
            };

            await api.post('/complaints', submissionData);
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit complaint. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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
                        <h2 className="fw-bold mb-3">Report Submitted Successfully!</h2>
                        <p className="text-muted fs-5">Thank you for your contribution. Our team will look into the issue and provide updates shortly.</p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-4">
                        <button
                            onClick={() => navigate('/complaints?view=my')}
                            className="btn btn-success px-4 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                            <FileVolume2 size={18} /> View My Complaints
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-primary px-4 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                            <MapIcon size={18} /> Go to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setFormData({
                                    title: '', type: '', priority: '', address: '', landmark: '', description: '', latitude: null, longitude: null, photo: null
                                });
                            }}
                            className="btn btn-outline-primary px-4 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                            <Plus size={18} /> Report Another Issue
                        </button>
                    </div>
                </motion.div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--primary-color)' }}>
                        <i className="bi bi-megaphone me-3"></i>Report a Civic Issue
                    </h1>
                    <p className="text-muted">Help us make your community better by reporting issues locally.</p>
                    {error && <div className="alert alert-danger rounded-3">{error}</div>}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        {/* Issue Details Card */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                                <div className="card-body p-4 p-md-5">
                                    <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-10">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3">
                                            <FileVolume2 className="text-primary" size={24} />
                                        </div>
                                        <h3 className="h4 fw-bold mb-0">Issue Details</h3>
                                    </div>

                                    <div className="row g-4">
                                        {/* Issue Title */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Issue Title</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    name="title"
                                                    className="form-control"
                                                    placeholder="Brief description of the issue"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Issue Type */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Issue Type</label>
                                            <select
                                                name="type"
                                                className="form-select"
                                                value={formData.type}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="" disabled>Select issue type</option>
                                                <option value="pothole">Pothole</option>
                                                <option value="garbage">Garbage</option>
                                                <option value="streetlight">Street Light</option>
                                                <option value="water">Water Leakage</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Priority Level */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Priority Level</label>
                                            <select
                                                name="priority"
                                                className="form-select"
                                                value={formData.priority}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="" disabled>Select priority</option>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Critical">Critical</option>
                                            </select>
                                        </div>

                                        {/* Address */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Address</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-transparent border-end-0">
                                                    <MapPin size={18} className="text-muted" />
                                                </span>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    className="form-control border-start-0"
                                                    placeholder="Enter street address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Nearby Landmark */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Nearby Landmark (Optional)</label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                className="form-control"
                                                placeholder="e.g., Near City Hall"
                                                value={formData.landmark}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Description</label>
                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="4"
                                                placeholder="Describe the issue in detail..."
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                            ></textarea>
                                        </div>

                                        {/* Photo Upload */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold" style={{ color: '#ef4444' }}>Upload Photo (Optional)</label>
                                            <input
                                                type="file"
                                                name="photo"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                            />
                                            {formData.photo && (
                                                <div className="mt-3">
                                                    <img
                                                        src={formData.photo}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                        </div>


                                        {/* Map Location */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold d-flex align-items-center mb-3" style={{ color: '#ef4444' }}>
                                                <MapIcon size={20} className="me-2" style={{ color: '#ef4444' }} />
                                                Location on Map
                                            </label>
                                            <div className="rounded-3 overflow-hidden border border-secondary border-opacity-10 shadow-sm" style={{ minHeight: '300px' }}>
                                                <MapSection onLocationSelect={handleLocationSelect} showComplaints={false} />
                                            </div>
                                            <small className="text-muted mt-2 d-flex align-items-center">
                                                <Info size={14} className="me-1" />
                                                Click on the map to mark the exact location
                                            </small>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="col-12 mt-5 text-center">
                                            <motion.button
                                                type="submit"
                                                className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg d-inline-flex align-items-center gap-2"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Report
                                                        <Send size={18} />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </motion.div>
        </PageWrapper>
    );
};

export default ReportIssue;
