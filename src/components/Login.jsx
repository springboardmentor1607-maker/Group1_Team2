import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PageWrapper from './PageWrapper';
import AuthWrapper from './AuthWrapper';

function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    })
    const navigate = useNavigate();

    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasCapital: false,
        hasSpecial: false
    })

    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    useEffect(() => {
        const validation = {
            minLength: password.length >= 8,
            hasCapital: /[A-Z]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        }
        setPasswordValidation(validation)
        setIsPasswordValid(validation.minLength && validation.hasCapital && validation.hasSpecial)
    }, [password])

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        if (errors.email) {
            setErrors({ ...errors, email: '' })
        }
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        if (errors.password) {
            setErrors({ ...errors, password: '' })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const newErrors = {}

        // Validation
        if (!email) {
            newErrors.email = 'Email is required'
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                newErrors.email = 'Please enter a valid email address'
            }
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (!isPasswordValid) {
            newErrors.password = 'Password must meet all requirements'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        console.log('Login attempt:', { email, password })

        const loginUser = async () => {
            try {
                const response = await api.post('/auth/login', { email, password });
                // Store token and auth state
                localStorage.setItem('token', response.token);
                localStorage.setItem('isAuthenticated', 'true');

                // Store user data including role
                if (response.user) {
                    localStorage.setItem('userRole', response.user.role);
                    localStorage.setItem('userData', JSON.stringify(response.user));
                }

                if (onLogin) {
                    onLogin();
                }

                // Redirect based on role
                if (response.user && response.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Login error:', err);
                setErrors({ ...errors, password: 'Invalid email or password' });
            }
        };

        loginUser();
    }

    return (
        <AuthWrapper mode="login">
            <form onSubmit={handleSubmit}>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4"
                >
                    <label htmlFor="loginEmail" className="form-label text-muted fw-semibold">Email Address</label>
                    <input
                        type="email"
                        className={`form-control glass-input py-3 mb-1 ${errors.email ? 'is-invalid border-danger' : ''}`}
                        id="loginEmail"
                        placeholder="name@example.com"
                        value={email}
                        onChange={handleEmailChange}
                    />
                    {errors.email && <div className="text-danger small mt-2 fw-medium">{errors.email}</div>}
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                >
                    <label htmlFor="loginPassword" className="form-label text-muted fw-semibold">Password</label>
                    <input
                        type="password"
                        className={`form-control glass-input py-3 mb-1 ${errors.password ? 'is-invalid border-danger' : ''}`}
                        id="loginPassword"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
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
                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="btn btn-primary w-100 py-3 mb-4 rounded-4 fw-bold shadow-lg border-0 shimmer-button"
                    style={{ background: 'var(--primary-color)', letterSpacing: '0.01em' }}
                >
                    Log In
                </motion.button>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <span className="text-muted fw-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary fw-bold text-decoration-none">
                            Create one
                        </Link>
                    </span>
                </motion.div>
            </form>
        </AuthWrapper>
    )
}

export default Login
