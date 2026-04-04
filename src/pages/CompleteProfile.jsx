import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2, Navigation } from 'lucide-react';
import { api } from '../lib/api';
import AuthWrapper from '../components/AuthWrapper';

const CompleteProfile = () => {
    const [formData, setFormData] = useState({
        location: '',
        state: ''
    });
    const [errors, setErrors] = useState({});
    const [isDetecting, setIsDetecting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    useEffect(() => {
        // Redirection logic if profile is already complete or user is not a volunteer
        if (userData.role !== 'volunteer' || (userData.location && userData.state)) {
            const role = userData.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'volunteer') navigate('/volunteer');
            else navigate('/dashboard');
        }
    }, [userData, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setErrors(prev => ({ ...prev, location: 'Geolocation not supported' }));
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await api.get(`/zones/reverse-geocode?lat=${latitude}&lon=${longitude}`);
                    if (response.data && response.data.success) {
                        const detectedState = response.data.state || '';
                        const detectedZone = response.data.zone || 
                                           (response.data.address ? response.data.address.split(',')[0] : '') || 
                                           detectedState || 
                                           'Detected Area';
                        
                        setFormData(prev => ({
                            ...prev,
                            location: detectedZone,
                            state: detectedState || prev.state
                        }));
                        setErrors(prev => ({ ...prev, location: '', state: '' }));
                    }
                } catch (err) {
                    console.error('Error in reverse geocoding:', err);
                    setErrors(prev => ({ ...prev, location: 'Could not resolve address' }));
                } finally {
                    setIsDetecting(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setErrors(prev => ({ ...prev, location: 'Location access denied. Please enter your area manually.' }));
                setIsDetecting(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.state) newErrors.state = 'State is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.put('/auth/profile', {
                ...userData,
                location: formData.location,
                state: formData.state
            });

            // Update local storage with full user data
            if (response.data && response.data.user) {
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            } else {
                // Fallback to manual update if response format is different
                const updatedUser = { ...userData, location: formData.location, state: formData.state };
                localStorage.setItem('userData', JSON.stringify(updatedUser));
            }

            navigate('/volunteer');
        } catch (err) {
            console.error('Profile completion error:', err);
            setErrors({ general: 'Failed to complete profile. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthWrapper mode="complete-profile">
            <p className="text-muted text-center mb-4 small">As a volunteer, we need your location details to assign relevant tasks near you.</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <div className="form-floating glass-input-group">
                        <input
                            type="text"
                            className={`form-control glass-input ${errors.state ? 'is-invalid' : ''}`}
                            id="state"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            disabled={isDetecting || submitting}
                        />
                        <label htmlFor="state" className="text-muted">State</label>
                        {errors.state && <div className="text-danger small mt-1 px-2">{errors.state}</div>}
                    </div>
                </div>

                <div className="mb-4 position-relative">
                    <div className="form-floating glass-input-group overflow-hidden">
                        <input
                            type="text"
                            className={`form-control glass-input ${errors.location ? 'is-invalid' : ''}`}
                            id="location"
                            name="location"
                            placeholder="Location/Zone"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={isDetecting || submitting}
                        />
                        <label htmlFor="location" className="text-muted">Location/Zone</label>
                        <button 
                            type="button" 
                            onClick={detectLocation}
                            disabled={isDetecting || submitting}
                            className="btn btn-link btn-sm p-0 position-absolute end-0 top-50 translate-middle-y me-3 text-primary z-3"
                        >
                            {isDetecting ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                                <Navigation size={18} />
                            )}
                        </button>
                    </div>
                    {errors.location && <div className="text-danger small mt-1 px-2">{errors.location}</div>}
                </div>

                {errors.general && <div className="alert alert-danger py-2 small mb-4">{errors.general}</div>}

                <motion.button
                    whileHover={{ scale: 1.01, translateY: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="btn btn-primary w-100 py-3 rounded-4 fw-bold shadow-premium border-0 shimmer-button"
                    disabled={submitting || isDetecting}
                >
                    {submitting ? 'Saving...' : 'Finish Setup'}
                </motion.button>
            </form>
        </AuthWrapper>
    );
};

export default CompleteProfile;
