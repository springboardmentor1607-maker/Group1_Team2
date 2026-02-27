import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

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
        <div className="auth-card">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Register for CleanStreet</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="signupFullName" className="form-label">Full Name</label>
                            <input
                                type="text"
                                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                id="signupFullName"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            {errors.fullName && <div className="text-danger small mt-1">{errors.fullName}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="signupUsername" className="form-label">Username</label>
                            <input
                                type="text"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                id="signupUsername"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="signupEmail" className="form-label">Email</label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="signupEmail"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="signupRole" className="form-label">I am registering as</label>
                            <select
                                className="form-control"
                                id="signupRole"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="citizen">Citizen (File complaints)</option>
                                <option value="volunteer">Volunteer (Handle complaints)</option>
                                <option value="admin">Admin (Manage system)</option>
                            </select>
                            <small className="text-muted">Citizens file complaints. Volunteers update work progress. Admins manage the entire system.</small>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="signupPhone" className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                id="signupPhone"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="signupPassword" className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                id="signupPassword"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
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
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 mb-3"
                        >
                            Register
                        </button>
                        <div className="text-center">
                            <small className="text-muted">
                                Already have an account?{' '}
                                <Link to="/login" className="text-decoration-none">
                                    Login
                                </Link>
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup
