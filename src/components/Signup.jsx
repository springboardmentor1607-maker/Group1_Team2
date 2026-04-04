import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../lib/api';
import PageWrapper from './PageWrapper';
import AuthWrapper from './AuthWrapper';
import { useToast } from '../context/ToastContext';

function Signup({ onLogin, getDashboardRoute }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'citizen',
        location: '',
        state: ''
    })
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasCapital: false,
        hasSpecial: false
    })

    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    const [errors, setErrors] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        location: '',
        state: ''
    })

    useEffect(() => {
        const password = formData.password
        const validation = {
            minLength: password.length >= 8,
            hasCapital: /[A-Z]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        }
        setPasswordValidation(validation)
        setIsPasswordValid(validation.minLength && validation.hasCapital && validation.hasSpecial)
    }, [formData.password])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const { fullName, username, email, phone, password, location } = formData
        const newErrors = {}

        // Validation
        if (!fullName) {
            newErrors.fullName = 'Full name is required'
        }

        if (!username) {
            newErrors.username = 'Username is required'
        }

        if (!email) {
            newErrors.email = 'Email is required'
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                newErrors.email = 'Please enter a valid email address'
            }
        }

        if (!phone) {
            newErrors.phone = 'Phone number is required'
        } else {
            const cleanPhone = phone.replace(/\D/g, '')
            if (cleanPhone.length < 10) {
                newErrors.phone = 'Please enter a valid phone number (at least 10 digits)'
            }
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else {
            // Password validation: min 8 chars, 1 capital letter, 1 special character
            const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
            if (!passwordRegex.test(password)) {
                newErrors.password = 'Password must contain at least 8 characters, 1 capital letter, and 1 special character'
            }
        }

        if (!location) {
            newErrors.location = 'Location is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        console.log('Registration attempt:', formData)

        const registerUser = async () => {
            try {
                // Map fullName to name for backend
                const { fullName, email, password, role, phone, location, state } = formData;
                const response = await api.post('/auth/register', {
                    name: fullName,
                    email,
                    password,
                    role,
                    phone,
                    location,
                    state
                });

                // Store token and auth state
                localStorage.setItem('token', response.token);
                localStorage.setItem('isAuthenticated', 'true');

                // Store user role (from form selection or response)
                const userRole = response.user?.role || role;
                localStorage.setItem('userRole', userRole);

                if (response.user) {
                    localStorage.setItem('userData', JSON.stringify(response.user));
                }

                showToast('Registration successful! Redirecting...', 'success');
                onLogin(response.user); // Pass user data back to root App
                navigate(getDashboardRoute());
            } catch (err) {
                console.error('Registration attempt error:', err);
                showToast(err.response?.data?.message || 'Registration failed. Please try again.', 'error');
            }
        };

        registerUser();
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('Google signup success, verifying with backend...');
            const response = await api.post('/auth/google', { 
                token: credentialResponse.credential,
                role: formData.role
            });

            // Store token and auth state
            localStorage.setItem('token', response.token);
            localStorage.setItem('isAuthenticated', 'true');

            // Store user data including role
            if (response.user) {
                localStorage.setItem('userRole', response.user.role);
                localStorage.setItem('userData', JSON.stringify(response.user));
            }

            if (onLogin) {
                onLogin(response.user);
            }

            // Use the getDashboardRoute helper for consistent redirection
            if (getDashboardRoute) {
                navigate(getDashboardRoute());
            } else {
                // Fallback
                const userRole = response.user?.role || 'citizen';
                if (userRole === 'admin') navigate('/admin');
                else if (userRole === 'volunteer') navigate('/volunteer');
                else navigate('/dashboard');
            }
        } catch (err) {
            console.error('Google signup backend error:', err);
            setErrors({ ...errors, email: 'Google registration failed. Please try again.' });
        }
    };

    const handleGoogleError = () => {
        console.error('Google signup failed');
        setErrors({ ...errors, email: 'Sign up with Google failed. Please try again.' });
    };

    const [isDetecting, setIsDetecting] = useState(false);
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({ ...prev, latitude, longitude }));
            try {
                const response = await api.get(`/zones/reverse-geocode?lat=${latitude}&lon=${longitude}`);
                if (response.success) {
                    const detectedState = response.state || '';
                    const detectedZone = response.zone || 'Detected Area';
                    
                    setFormData(prev => ({
                        ...prev,
                        location: detectedZone,
                        state: detectedState || prev.state
                    }));
                    
                    // Clear errors for these fields
                    setErrors(prev => ({ ...prev, location: '', state: '' }));
                    showToast('Location detected successfully', 'success');
                }
            } catch (err) {
                console.error('Error in reverse geocoding:', err);
                showToast('Location detected but address could not be fetched', 'warning');
            } finally {
                setIsDetecting(false);
            }
        },
        (err) => {
            console.error('Geolocation error:', err);
            showToast('Permission denied or location unavailable', 'error');
            setIsDetecting(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
};

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <AuthWrapper mode="signup">
            <motion.form 
                onSubmit={handleSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="row g-4">
                    {/* Full Name */}
                    <motion.div variants={itemVariants} className="col-12">
                        <div className="form-floating glass-input-group">
                            <input
                                type="text"
                                className={`form-control glass-input ${errors.fullName ? 'is-invalid border-danger' : ''}`}
                                id="signupFullName"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            <label htmlFor="signupFullName" className="text-muted">Full Name</label>
                            {errors.fullName && <div className="text-danger small mt-1 px-2 fw-medium">{errors.fullName}</div>}
                        </div>
                    </motion.div>

                    {/* Username & Phone Number */}
                    <motion.div variants={itemVariants} className="col-md-6">
                        <div className="form-floating glass-input-group">
                            <input
                                type="text"
                                className={`form-control glass-input ${errors.username ? 'is-invalid border-danger' : ''}`}
                                id="signupUsername"
                                name="username"
                                placeholder="johndoe123"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <label htmlFor="signupUsername" className="text-muted">Username</label>
                            {errors.username && <div className="text-danger small mt-1 px-2 fw-medium">{errors.username}</div>}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="col-md-6">
                        <div className="form-floating glass-input-group">
                            <input
                                type="tel"
                                className={`form-control glass-input ${errors.phone ? 'is-invalid border-danger' : ''}`}
                                id="signupPhone"
                                name="phone"
                                placeholder="(555) 000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <label htmlFor="signupPhone" className="text-muted">Phone Number</label>
                            {errors.phone && <div className="text-danger small mt-1 px-2 fw-medium">{errors.phone}</div>}
                        </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants} className="col-12">
                        <div className="form-floating glass-input-group">
                            <input
                                type="email"
                                className={`form-control glass-input ${errors.email ? 'is-invalid border-danger' : ''}`}
                                id="signupEmail"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <label htmlFor="signupEmail" className="text-muted">Email Address</label>
                            {errors.email && <div className="text-danger small mt-1 px-2 fw-medium">{errors.email}</div>}
                        </div>
                    </motion.div>

                    {/* Account Type */}
                    <motion.div variants={itemVariants} className="col-md-6">
                        <div className="form-floating glass-input-group">
                            <select
                                className="form-select glass-input h-auto fw-medium"
                                id="signupRole"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ paddingTop: '1.625rem', paddingBottom: '0.625rem', color: 'var(--text-primary)' }}
                            >
                                <option value="citizen">Citizen</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <label htmlFor="signupRole" className="text-muted">Account Type</label>
                        </div>
                    </motion.div>

                    {/* State */}
                    <motion.div variants={itemVariants} className="col-md-6 text-start">
                        <div className="form-floating glass-input-group">
                            <input
                                type="text"
                                className={`form-control glass-input ${errors.state ? 'is-invalid border-danger' : ''} ${isDetecting ? 'opacity-75' : ''}`}
                                id="signupState"
                                name="state"
                                placeholder="Your state"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={isDetecting}
                            />
                            <label htmlFor="signupState" className="text-muted small">State</label>
                            {errors.state && <div className="text-danger small mt-1 px-2 fw-medium">{errors.state}</div>}
                        </div>
                    </motion.div>

                    {/* Location */}
                    <motion.div variants={itemVariants} className="col-md-6 text-start">
                        <div className="form-floating glass-input-group position-relative">
                            <input
                                type="text"
                                className={`form-control glass-input ${formData.location && !errors.location ? 'border-success border-opacity-50' : ''} ${errors.location ? 'is-invalid border-danger' : ''} ${isDetecting ? 'opacity-75' : ''}`}
                                id="signupLocation"
                                name="location"
                                placeholder={isDetecting ? "Detecting location..." : "Your area/zone"}
                                value={formData.location}
                                onChange={handleChange}
                                disabled={isDetecting}
                            />
                            <label htmlFor="signupLocation" className="text-muted small">
                                {isDetecting ? "Searching..." : "Location/Zone"}
                            </label>
                            <button 
                                type="button" 
                                onClick={handleGetLocation}
                                disabled={isDetecting}
                                className={`btn btn-link btn-sm p-0 position-absolute end-0 top-50 translate-middle-y me-3 text-primary text-decoration-none z-3 ${isDetecting ? 'opacity-50' : ''}`}
                                style={{ pointerEvents: 'auto' }}
                            >
                                {isDetecting ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    <i className="bi bi-crosshair fs-6"></i>
                                )}
                            </button>
                            {errors.location && <div className="text-danger small mt-1 px-2 fw-medium">{errors.location}</div>}
                        </div>
                    </motion.div>

                    {/* Password */}
                    <motion.div variants={itemVariants} className="col-12">
                        <div className="form-floating glass-input-group mb-2">
                            <input
                                type="password"
                                className={`form-control glass-input ${errors.password ? 'is-invalid border-danger' : ''}`}
                                id="signupPassword"
                                name="password"
                                placeholder="Create a secure password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <label htmlFor="signupPassword" className="text-muted">Password</label>
                            {errors.password && <div className="text-danger small mt-1 px-2 fw-medium">{errors.password}</div>}
                        </div>

                        <AnimatePresence>
                            {passwordFocused && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-3"
                                >
                                    <div className="d-flex flex-wrap gap-x-4 py-2">
                                        <small className={`d-flex align-items-center gap-1 ${passwordValidation.minLength ? 'text-success' : 'text-danger'} opacity-75`} style={{ fontSize: '0.75rem' }}>
                                            <i className={`bi bi-${passwordValidation.minLength ? 'check-circle' : 'x-circle'}`}></i> 8+ chars
                                        </small>
                                        <small className={`d-flex align-items-center gap-1 ${passwordValidation.hasCapital ? 'text-success' : 'text-danger'} opacity-75`} style={{ fontSize: '0.75rem' }}>
                                            <i className={`bi bi-${passwordValidation.hasCapital ? 'check-circle' : 'x-circle'}`}></i> 1 Capital
                                        </small>
                                        <small className={`d-flex align-items-center gap-1 ${passwordValidation.hasSpecial ? 'text-success' : 'text-danger'} opacity-75`} style={{ fontSize: '0.75rem' }}>
                                            <i className={`bi bi-${passwordValidation.hasSpecial ? 'check-circle' : 'x-circle'}`}></i> 1 Special
                                        </small>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
                
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, translateY: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="btn btn-primary w-100 py-3 mt-4 rounded-4 fw-bold shadow-premium border-0 shimmer-button"
                    style={{ background: 'var(--primary-color)', letterSpacing: '0.01em', fontSize: '1rem' }}
                >
                    Create Account
                </motion.button>

                <motion.div 
                    variants={itemVariants}
                    className="my-4 d-flex align-items-center"
                >
                    <hr className="flex-grow-1 border-secondary opacity-25" />
                    <span className="px-3 text-muted small fw-bold">OR REGISTER WITH</span>
                    <hr className="flex-grow-1 border-secondary opacity-25" />
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className="mb-4 d-flex justify-content-center google-signup-container"
                >
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        text="signup_with"
                        width="100%"
                    />
                </motion.div>
                
                <motion.div 
                    variants={itemVariants}
                    className="text-center mt-5"
                >
                    <span className="text-muted fw-medium small">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary fw-bold text-decoration-none hover-underline">
                            Log In
                        </Link>
                    </span>
                </motion.div>
            </motion.form>
        </AuthWrapper>
    )
}

export default Signup
