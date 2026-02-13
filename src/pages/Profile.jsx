import React, { useState, useEffect } from 'react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        role: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No authentication token found');
                    return;
                }

                const response = await fetch('http://localhost:3001/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const { user: userData } = await response.json();
                    setUser(userData);
                    setFormData({
                        name: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        location: userData.location || '',
                        role: userData.role || ''
                    });
                } else {
                    // Fallback to localStorage if API call fails
                    const localUserData = localStorage.getItem('user');
                    if (localUserData) {
                        const parsedUser = JSON.parse(localUserData);
                        setUser(parsedUser);
                        setFormData({
                            name: parsedUser.name || '',
                            email: parsedUser.email || '',
                            phone: parsedUser.phone || '',
                            location: parsedUser.location || '',
                            role: parsedUser.role || ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Fallback to localStorage if API call fails
                const localUserData = localStorage.getItem('user');
                if (localUserData) {
                    try {
                        const parsedUser = JSON.parse(localUserData);
                        setUser(parsedUser);
                        setFormData({
                            name: parsedUser.name || '',
                            email: parsedUser.email || '',
                            phone: parsedUser.phone || '',
                            location: parsedUser.location || '',
                            role: parsedUser.role || ''
                        });
                    } catch (parseError) {
                        console.error('Error parsing user data:', parseError);
                        setError('Error loading user data');
                    }
                }
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser.user);
                localStorage.setItem('user', JSON.stringify(updatedUser.user));
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                role: user.role || ''
            });
        }
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-96 relative">
                {/* Animated Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                </div>
                
                <div className="text-center relative z-10">
                    <div className="relative">
                        <div className="spinner-modern w-16 h-16 mx-auto mb-6"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent-1 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-gray-400 text-lg font-medium">Loading your profile...</p>
                    <div className="mt-4">
                        <div className="w-32 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-1 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto page-transition px-4 sm:px-0 force-light">
            {/* Floating Background Elements - Hidden on mobile */}
            <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="hidden lg:block absolute bottom-20 left-20 w-80 h-80 bg-accent-1/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            <div className="glass-card profile-card rounded-xl sm:rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl relative z-10">
                {/* Header with Enhanced Styling */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative">
                                <div className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-gradient-to-br from-primary-500 to-accent-1 rounded-full flex items-center justify-center shadow-2xl">
                                </div>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-1 opacity-20 blur-xl"></div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                                    {user.name}
                                </h1>
                                <p className="text-gray-700 dark:text-gray-300 capitalize flex items-center justify-center sm:justify-start mt-2">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 sm:mt-0">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-modern profile-btn-primary bg-primary-600 hover:bg-primary-700 text-white inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 interactive-element w-full sm:w-auto justify-center"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="btn-modern bg-primary-600 hover:bg-primary-700 text-white inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 disabled:opacity-50 neon-glow w-full sm:w-auto justify-center"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="profile-btn-secondary bg-transparent border-2 border-gray-300/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 interactive-element w-full sm:w-auto justify-center"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content with Enhanced Styling */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Status Messages */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <strong className="sr-only">Error:</strong>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <strong className="sr-only">Success:</strong>
                                <span className="text-sm">{success}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                        {/* Personal Information Section */}
                        <div className="glass-card p-4 sm:p-6 rounded-xl border border-white/10">
                            <h2 className="text-xl font-semibold gradient-text mb-6 flex items-center">
                                Personal Information
                            </h2>
                            <div className="space-y-4 sm:space-y-6">
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="input-modern profile-input w-full px-4 py-3 placeholder-gray-400 focus:outline-none"
                                            required
                                        />
                                    ) : (
                                        <p className="glass-card px-4 py-3 rounded-lg border border-white/10 profile-value">
                                            {user.name || 'Not specified'}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="input-modern profile-input w-full px-4 py-3 placeholder-gray-400 focus:outline-none"
                                            required
                                        />
                                    ) : (
                                        <p className="glass-card px-4 py-3 rounded-lg border border-white/10 profile-value">
                                            {user.email}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter phone number"
                                            className="input-modern profile-input w-full px-4 py-3 placeholder-gray-400 focus:outline-none"
                                        />
                                    ) : (
                                        <p className="glass-card px-4 py-3 rounded-lg border border-white/10 profile-value">
                                            {user.phone || 'Not specified'}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Location
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="Enter your city/area"
                                            className="input-modern profile-input w-full px-4 py-3 placeholder-gray-400 focus:outline-none"
                                        />
                                    ) : (
                                        <p className="glass-card px-4 py-3 rounded-lg border border-white/10 profile-value">
                                            {user.location || 'Not specified'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Information Section */}
                        <div className="glass-card p-4 sm:p-6 rounded-xl border border-white/10 mt-6 xl:mt-0">
                            <h2 className="text-xl font-semibold gradient-text mb-6 flex items-center">
                                Account Information
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role
                                    </label>
                                    <p className="glass-card px-4 py-3 rounded-lg border border-white/10 capitalize profile-value">
                                        {user.role}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Member Since
                                    </label>
                                    <p className="glass-card px-4 py-3 rounded-lg border border-white/10 profile-value">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        User ID
                                    </label>
                                    <p className="glass-card px-4 py-3 rounded-lg border border-white/10 font-mono text-sm profile-value">
                                        {user.id || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}