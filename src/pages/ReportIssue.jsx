import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileVolume2, AlertTriangle, Send, Map as MapIcon, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapSection from '../components/MapSection';
import { api } from '../lib/api';

const ReportIssue = () => {
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        priority: '',
        address: '',
        landmark: '',
        description: '',
        latitude: null,
        longitude: null
    });

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            await api.post('/complaints', formData);
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
            <div className="container-lg px-3 px-md-4 py-5 text-center">
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
                                    title: '', type: '', priority: '', address: '', landmark: '', description: '', latitude: null, longitude: null
                                });
                            }}
                            className="btn btn-outline-primary px-4 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                            <Plus size={18} /> Report Another Issue
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <h1 className="display-5 fw-bold mb-2" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--accent-1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                                            <label className="form-label fw-semibold text-body">Issue Title</label>
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
                                            <label className="form-label fw-semibold text-body">Issue Type</label>
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
                                            <label className="form-label fw-semibold text-body">Priority Level</label>
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
                                            <label className="form-label fw-semibold text-body">Address</label>
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
                                            <label className="form-label fw-semibold text-body">Nearby Landmark (Optional)</label>
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
                                            <label className="form-label fw-semibold text-body">Description</label>
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

                                        {/* Map Location */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold text-body d-flex align-items-center mb-3">
                                                <MapIcon size={20} className="me-2 text-primary" />
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
                                                {submitting ? 'Submitting...' : 'Submit Report'}
                                                {!submitting && <Send size={18} />}
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ReportIssue;
