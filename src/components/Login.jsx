import React, { useState } from 'react'

function Login({ showSignup, onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

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
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative">
            {/* Floating Background Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-10 lg:top-20 left-10 lg:left-20 w-48 lg:w-72 h-48 lg:h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="hidden md:block absolute bottom-10 lg:bottom-20 right-10 lg:right-20 w-64 lg:w-96 h-64 lg:h-96 bg-accent-1/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            <div className="w-full max-w-sm sm:max-w-md relative z-10">
                <div className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-primary-500 to-accent-1 rounded-full flex items-center justify-center mb-4 float-animation">
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Sign in to continue to CleanStreet</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                    id="loginEmail"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-black/20 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-black/30 transition-all duration-300 group-hover:border-gray-500 text-sm sm:text-base"
                                    id="loginPassword"
                                    placeholder="Enter your secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-1/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm" role="alert">
                                <div className="flex items-center">
                                    {error}
                                </div>
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="btn-modern w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group" 
                            disabled={isLoading}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {isLoading ? (
                                    <>
                                        <div className="spinner-modern w-5 h-5 mr-3"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                    </>
                                )}
                            </span>
                        </button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600/30"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-gray-400">New to CleanStreet?</span>
                            </div>
                        </div>
                        
                        <button 
                            type="button"
                            className="w-full bg-transparent border-2 border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400 font-semibold py-3 px-6 rounded-xl transition-all duration-300 interactive-element"
                            onClick={showSignup}
                        >
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
