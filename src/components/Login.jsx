import React, { useState } from 'react'

function Login({ showSignup }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validation
        if (!email || !password) {
            alert('Please fill in all fields')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address')
            return
        }

        console.log('Login attempt:', { email, password })
        alert('Login functionality would be implemented here')
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
                                className="form-control"
                                id="loginEmail"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="loginPassword" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="loginPassword"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
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
