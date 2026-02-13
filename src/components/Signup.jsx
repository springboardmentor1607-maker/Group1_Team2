import React, { useState } from 'react'

function Signup({ showLogin, onLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        location: '',
        role: 'user'
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const { fullName, username, email, phone, password, location } = formData

        // Validation
        if (!fullName || !email || !password) {
            setError('Please fill in all required fields')
            setIsLoading(false)
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setIsLoading(false)
            return
        }

        if (phone) {
            const cleanPhone = phone.replace(/\D/g, '')
            if (cleanPhone.length < 10) {
                setError('Please enter a valid phone number')
                setIsLoading(false)
                return
            }
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: fullName, 
                    email, 
                    password, 
                    location: location || 'Not specified',
                    role: formData.role 
                }),
            })

            const data = await response.json()

            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.token)
                alert('Registration successful! Logging you in...')
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
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative">
            {/* Floating Background Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-5 lg:top-10 right-5 lg:right-10 w-48 lg:w-64 h-48 lg:h-64 bg-accent-1/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="hidden md:block absolute bottom-5 lg:bottom-10 left-5 lg:left-10 w-60 lg:w-80 h-60 lg:h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-1500"></div>
            
            <div className="w-full max-w-md sm:max-w-lg relative z-10">
                <div className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-accent-1 to-primary-500 rounded-full flex items-center justify-center mb-4 float-animation">
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Join CleanStreet</h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Create your account to start making a difference</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="signupFullName" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Full Name *
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                        id="signupFullName"
                                        name="fullName"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="signupRole" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Role *
                                </label>
                                <div className="relative group">
                                    <select
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                        id="signupRole"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value="citizen" className="bg-gray-800">Citizen</option>
                                        <option value="volunteer" className="bg-gray-800">Volunteer</option>
                                        <option value="admin" className="bg-gray-800">Admin</option>
                                    </select>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="signupEmail" className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Address *
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                    id="signupEmail"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="signupPhone" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Phone Number <span className="text-gray-500">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                        id="signupPhone"
                                        name="phone"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="signupLocation" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Location <span className="text-gray-500">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                        id="signupLocation"
                                        name="location"
                                        placeholder="Mumbai, Maharashtra"
                                        value={formData.location}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="signupPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                                Password *
                            </label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                    id="signupPassword"
                                    name="password"
                                    placeholder="Create a secure password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2.5 rounded-lg text-sm" role="alert">
                                {error}
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed text-sm sm:text-base" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <button 
                                    type="button"
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                    onClick={showLogin}
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup
