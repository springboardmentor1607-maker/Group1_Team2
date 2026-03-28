import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PageWrapper from './PageWrapper';
import AuthWrapper from './AuthWrapper';

function Signup({ onLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'citizen'
    })
    const navigate = useNavigate();

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
        password: ''
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

        const { fullName, username, email, phone, password } = formData
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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        console.log('Registration attempt:', formData)

        const registerUser = async () => {
            try {
                // Map fullName to name for backend
                const { fullName, email, password, role, phone } = formData;
                const response = await api.post('/auth/register', {
                    name: fullName,
                    email,
                    password,
                    role,
                    phone
                });

                // Store token and auth state
                localStorage.setItem('token', response.token);
                localStorage.setItem('isAuthenticated', 'true');

                // Store user role (from form selection)
                localStorage.setItem('userRole', role);

                if (onLogin) {
                    onLogin();
                }

                // Redirect based on role
                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Registration error:', err);
                setErrors({ ...errors, email: 'Registration failed. Email might already be in use.' });
            }
        };

        registerUser();
    }

    return (
        <AuthWrapper mode="signup">
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-12 mb-3"
                    >
                        <label htmlFor="signupFullName" className="form-label text-muted fw-semibold">Full Name</label>
                    <input
                        type="text"
                        className={`form-control glass-input py-2 ${errors.fullName ? 'is-invalid border-danger' : ''}`}
                        id="signupFullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    {errors.fullName && <div className="text-danger small mt-2 fw-medium">{errors.fullName}</div>}
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-md-6 mb-3"
                    >
                        <label htmlFor="signupUsername" className="form-label text-muted fw-semibold">Username</label>
                    <input
                        type="text"
                        className={`form-control glass-input py-2 ${errors.username ? 'is-invalid border-danger' : ''}`}
                        id="signupUsername"
                        name="username"
                        placeholder="johndoe123"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    {errors.username && <div className="text-danger small mt-2 fw-medium">{errors.username}</div>}
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-md-6 mb-3"
                    >
                        <label htmlFor="signupPhone" className="form-label text-muted fw-semibold">Phone Number</label>
                        <input
                            type="tel"
                            className={`form-control glass-input py-2 ${errors.phone ? 'is-invalid border-danger' : ''}`}
                            id="signupPhone"
                            name="phone"
                            placeholder="(555) 000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <div className="text-danger small mt-2 fw-medium">{errors.phone}</div>}
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-12 mb-3"
                    >
                        <label htmlFor="signupEmail" className="form-label text-muted fw-semibold">Email Address</label>
                    <input
                        type="email"
                        className={`form-control glass-input py-2 ${errors.email ? 'is-invalid border-danger' : ''}`}
                        id="signupEmail"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="text-danger small mt-2 fw-medium">{errors.email}</div>}
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="col-12 mb-3"
                    >
                        <label htmlFor="signupRole" className="form-label text-muted fw-semibold">Account Type</label>
                    <select
                        className="form-select glass-input py-2"
                        id="signupRole"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="citizen">Citizen (File complaints)</option>
                        <option value="volunteer">Volunteer (Handle complaints)</option>
                        <option value="admin">Admin (Manage system)</option>
                    </select>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="col-12 mb-4"
                    >
                        <label htmlFor="signupPassword" className="form-label text-muted fw-semibold">Password</label>
                    <input
                        type="password"
                        className={`form-control glass-input py-2 ${errors.password ? 'is-invalid border-danger' : ''}`}
                        id="signupPassword"
                        name="password"
                        placeholder="Create a secure password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                    />
                    {errors.password && <div className="text-danger small mt-2 fw-medium">{errors.password}</div>}
                    {passwordFocused && (
                        <div className="mt-2">
                            <small className={passwordValidation.minLength ? 'text-success' : 'text-danger'}>
                                {passwordValidation.minLength ? '✓' : '✗'} At least 8 characters
                            </small>
                            <br />
                            <small className={passwordValidation.hasCapital ? 'text-success' : 'text-danger'}>
                                {passwordValidation.hasCapital ? '✓' : '✗'} At least 1 capital letter
                            </small>
                            <br />
                            <small className={passwordValidation.hasSpecial ? 'text-success' : 'text-danger'}>
                                {passwordValidation.hasSpecial ? '✓' : '✗'} At least 1 special character (!@#$%^&*...)
                            </small>
                        </div>
                    )}
                    </motion.div>
                </div>
                
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-primary w-100 py-3 mb-4 rounded-4 fw-bold shadow-lg border-0 shimmer-button"
                    style={{ background: 'var(--primary-color)', letterSpacing: '0.01em' }}
                >
                    Create Account
                </motion.button>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <span className="text-muted fw-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary fw-bold text-decoration-none">
                            Log In
                        </Link>
                    </span>
                </motion.div>
            </form>
        </AuthWrapper>
    )
}

export default Signup
