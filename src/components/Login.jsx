import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../lib/api';
import PageWrapper from './PageWrapper';
import AuthWrapper from './AuthWrapper';
import { useToast } from '../context/ToastContext';

function Login({ onLogin, getDashboardRoute }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({
        email: '',
        password: ''
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
                console.error('Login error:', err);
                showToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
            }
        };

        loginUser();
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('Google login success, verifying with backend...');
            const response = await api.post('/auth/google', { 
                token: credentialResponse.credential 
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
                const role = response.user?.role || 'citizen';
                if (role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            console.error('Google login backend error:', err);
            showToast(err.response?.data?.message || 'Google authentication failed. Please try again.', 'error');
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
        showToast('Login with Google failed. Please try again.', 'error');
    };

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
                    Sign In
                </motion.button>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mb-4 d-flex align-items-center"
                >
                    <hr className="flex-grow-1 border-secondary opacity-25" />
                    <span className="px-3 text-muted small fw-bold">OR CONTINUE WITH</span>
                    <hr className="flex-grow-1 border-secondary opacity-25" />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4 d-flex justify-content-center google-login-container"
                >
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        text="signin_with"
                        width="100%"
                    />
                </motion.div>
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
