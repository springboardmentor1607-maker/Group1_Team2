import React, { useState, useEffect } from 'react'

function Login({ showSignup }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
        alert('Login successful! (This would redirect to dashboard)')
    }

    return (
        <div className="auth-card">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Login to CleanStreet</h2>
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
                        <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
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
