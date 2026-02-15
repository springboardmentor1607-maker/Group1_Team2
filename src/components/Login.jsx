import React, { useState, useEffect } from 'react'

function Login({ showSignup, onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    })

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const newErrors = {}

        // Validation
        if (!email || !password) {
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

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                onLogin() // Call the onLogin callback
            } else {
                setError(data.message || 'Login failed')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Network error. Please check if the backend server is running.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-card">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Login to CleanStreet</h2>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="loginEmail" className="form-label">Email</label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="loginEmail"
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                            {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="loginPassword" className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                id="loginPassword"
                                placeholder="Enter your password"
                                value={password}
                                onChange={handlePasswordChange}
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
                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="text-center">
                            <small className="text-muted">
                                Don't have an account?{' '}
                                <a href="#" className="text-decoration-none" onClick={(e) => { e.preventDefault(); showSignup(); }}>
                                    Register
                                </a>
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
