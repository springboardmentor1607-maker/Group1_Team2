import React, { useState } from 'react'

function Signup({ showLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'user'
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const { fullName, username, email, phone, password } = formData

        // Validation
        if (!fullName || !username || !email || !password) {
            alert('Please fill in all required fields')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address')
            return
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long')
            return
        }

        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '')
            if (cleanPhone.length < 10) {
                alert('Please enter a valid phone number')
                return
            }
        }

        console.log('Registration attempt:', formData)
        alert('Registration functionality would be implemented here')
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
                            <label htmlFor="signupPhone" className="form-label">
                                Phone Number <span className="text-muted">(Optional)</span>
                            </label>
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
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
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
