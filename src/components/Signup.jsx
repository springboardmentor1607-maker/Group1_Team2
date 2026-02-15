import React, { useState, useEffect } from 'react'

function Signup({ showLogin, onLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'user'
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasCapital: false,
        hasSpecial: false
    })

    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

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
        if (error) {
            setError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const { fullName, username, email, phone, password } = formData
        const newErrors = {}

        // Validation
        if (!fullName || !username || !email || !phone || !password) {
            setError('Please fill in all fields')
            setIsLoading(false)
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            setIsLoading(false)
            return
        }

        if (!isPasswordValid) {
            setError('Password must meet all requirements')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fullName,
                    username,
                    email,
                    phone,
                    password,
                    role: formData.role
                }),
            })

            const data = await response.json()

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                onLogin() // Call the onLogin callback
            } else {
                setError(data.message || 'Registration failed')
            }
        } catch (err) {
            console.error('Registration error:', err)
            setError('Network error. Please check if the backend server is running.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-card">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Register for CleanStreet</h2>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="signupFullName" className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="signupFullName"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="signupUsername" className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="signupUsername"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="signupEmail" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="signupEmail"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="signupRole" className="form-label">Role</label>
                            <select
                                className="form-control"
                                id="signupRole"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="user">User</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="signupPhone" className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="signupPhone"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="signupPassword" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="signupPassword"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                        <div className="text-center">
                            <small className="text-muted">
                                Already have an account?{' '}
                                <a href="#" className="text-decoration-none" onClick={(e) => { e.preventDefault(); showLogin(); }}>
                                    Login
                                </a>
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup
