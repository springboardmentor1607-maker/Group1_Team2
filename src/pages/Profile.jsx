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
                // First, load user data from localStorage
                const localUserData = localStorage.getItem('user');
                if (localUserData && localUserData !== 'undefined' && localUserData !== 'null') {
                    try {
                        const parsedUser = JSON.parse(localUserData);
                        // Ensure phone and location fields exist
                        const userWithDefaults = {
                            ...parsedUser,
                            phone: parsedUser.phone || '+1 (555) 123-4567',
                            location: parsedUser.location || 'New York, NY'
                        };
                        setUser(userWithDefaults);
                        setFormData({
                            name: userWithDefaults.name || '',
                            email: userWithDefaults.email || '',
                            phone: userWithDefaults.phone || '',
                            location: userWithDefaults.location || '',
                            role: userWithDefaults.role || ''
                        });
                        // Update localStorage with complete user data
                        localStorage.setItem('user', JSON.stringify(userWithDefaults));
                    } catch (parseError) {
                        console.error('Error parsing local user data:', parseError);
                        // Set default user data if parsing fails
                        const defaultUser = {
                            name: 'Guest User',
                            email: 'guest@example.com',
                            phone: '+1 (555) 123-4567',
                            location: 'New York, NY',
                            role: 'citizen'
                        };
                        setUser(defaultUser);
                        setFormData(defaultUser);
                        localStorage.setItem('user', JSON.stringify(defaultUser));
                    }
                } else {
                    // Set default user if no local data exists
                    const defaultUser = {
                        name: 'Guest User',
                        email: 'guest@example.com',
                        phone: '+1 (555) 123-4567',
                        location: 'New York, NY',
                        role: 'citizen'
                    };
                    setUser(defaultUser);
                    setFormData(defaultUser);
                    localStorage.setItem('user', JSON.stringify(defaultUser));
                }

                // Try to sync with backend if available (optional)
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await fetch('http://localhost:3001/api/auth/profile', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            timeout: 5000 // 5 second timeout
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
                            // Update localStorage with backend data
                            localStorage.setItem('user', JSON.stringify(userData));
                        }
                    } catch (apiError) {
                        // Backend not available - continue with localStorage data
                        console.info('Backend not available, using local data');
                    }
                }
            } catch (error) {
                console.error('Error in fetchUserData:', error);
                // Ensure we always have some user data
                if (!user) {
                    const defaultUser = {
                        name: 'Guest User',
                        email: 'guest@example.com',
                        phone: '',
                        location: '',
                        role: 'citizen'
                    };
                    setUser(defaultUser);
                    setFormData(defaultUser);
                    localStorage.setItem('user', JSON.stringify(defaultUser));
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
            // Update localStorage immediately
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            // Try to sync with backend if available
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:3001/api/auth/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formData),
                        timeout: 5000
                    });

                    if (response.ok) {
                        const { user: updatedUserFromAPI } = await response.json();
                        setUser(updatedUserFromAPI);
                        localStorage.setItem('user', JSON.stringify(updatedUserFromAPI));
                        setSuccess('Profile updated successfully (synced with server)');
                    } else {
                        setSuccess('Profile updated locally (server sync failed)');
                    }
                } catch (apiError) {
                    console.info('Backend sync failed, profile saved locally');
                    setSuccess('Profile updated locally (server unavailable)');
                }
            } else {
                setSuccess('Profile updated locally');
            }
            
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
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
            <div className="d-flex align-items-center justify-content-center position-relative" style={{ minHeight: '400px' }}>
                {/* Animated Background */}
                <div className="position-absolute top-50 start-50 translate-middle">
                    <div style={{ width: '128px', height: '128px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }} className="opacity-75"></div>
                </div>
                
                <div className="text-center position-relative" style={{ zIndex: 10 }}>
                    <div className="position-relative mb-4">
                        <div className="spinner-border text-primary mx-auto" style={{ width: '4rem', height: '4rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <p className="text-muted fs-5 fw-medium">Loading your profile...</p>
                    <div className="mt-4">
                        <div className="progress mx-auto" style={{ width: '128px', height: '4px' }}>
                            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-1))' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-lg page-transition profile-page px-3 px-md-4 py-4 position-relative">
            {/* Floating Background Elements - Hidden on mobile */}
            <div className="d-none d-lg-block position-absolute" style={{ top: '80px', right: '80px', width: '200px', height: '200px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))', borderRadius: '50%', filter: 'blur(40px)' }}></div>
            <div className="d-none d-lg-block position-absolute" style={{ bottom: '80px', left: '80px', width: '250px', height: '250px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(20, 184, 166, 0.08))', borderRadius: '50%', filter: 'blur(50px)' }}></div>
            
            <div className="card border-0 shadow-lg rounded-4 position-relative bg-card" style={{ zIndex: 10 }}>
                {/* Header with Enhanced Styling */}
                <div className="card-header bg-transparent border-bottom px-4 px-lg-5 py-5" style={{ borderColor: 'var(--bs-border-color)' }}>
                    <div className="d-flex flex-column flex-lg-row align-items-center align-items-lg-start justify-content-lg-between gap-4">
                        <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                            <div className="position-relative">
                                <div className="rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '90px', height: '90px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                    <span className="display-3 text-white fw-bold">{user.name?.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', opacity: 0.2, filter: 'blur(15px)' }}></div>
                            </div>
                            <div className="text-center text-md-start">
                                <h1 className="h2 fw-bold mb-2 gradient-text">{user.name}</h1>
                                <p className="mb-2" style={{ color: 'var(--bs-secondary-color)' }}>
                                    <i className="bi bi-person-badge me-2"></i>
                                    <span className="text-capitalize">{user.role}</span>
                                </p>
                                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
                                    <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', fontSize: '0.8rem' }}>Active Member</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-gradient d-flex align-items-center px-4 py-2 rounded-3 shadow-sm"
                                >
                                    <i className="bi bi-pencil-square me-2"></i>Edit Profile
                                </button>
                            ) : (
                                <div className="d-flex flex-column flex-md-row gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="btn btn-success d-flex align-items-center px-4 py-2 rounded-3 shadow-sm"
                                    >
                                        <i className="bi bi-check-lg me-2"></i>{isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="btn btn-outline-secondary d-flex align-items-center px-4 py-2 rounded-3"
                                    >
                                        <i className="bi bi-x-lg me-2"></i>Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content with Enhanced Styling */}
                <div className="card-body px-4 px-lg-5 py-5">
                    {/* Status Messages */}
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center mb-4 rounded-3 border-0 shadow-sm" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success d-flex align-items-center mb-4 rounded-3 border-0 shadow-sm" role="alert">
                            <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="row g-4">
                        {/* Personal Information Section */}
                        <div className="col-12 col-xl-6">
                            <div className="card profile-card h-100 border-0 shadow-sm rounded-3 bg-card">
                                <div className="card-body p-4">
                                    <h2 className="h4 fw-semibold mb-4 d-flex align-items-center gradient-text">
                                        <i className="bi bi-person-circle me-3" style={{ fontSize: '1.5rem' }}></i>Personal Information
                                    </h2>
                                    <div className="d-flex flex-column gap-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#000000' }}>
                                                <i className="bi bi-person me-2 text-primary"></i>Full Name *
                                            </label>
                                            {isEditing ? (
                                                <div className="input-group">
                                                    <span className="input-group-text border-end-0 rounded-start-3" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)' }}>
                                                        <i className="bi bi-person text-primary"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="form-control border-start-0 rounded-end-3 py-3"
                                                        style={{ 
                                                            backgroundColor: 'var(--bs-body-bg)', 
                                                            borderColor: 'var(--bs-border-color)',
                                                            color: '#ffffff',
                                                            fontSize: '1rem'
                                                        }}
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>
                                            ) : (
                                                <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#000000', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)' }}>
                                                    <i className="bi bi-person me-2 text-primary"></i>
                                                    <span style={{ color: '#000000' }}>{user.name || 'Click edit to add name'}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#000000' }}>
                                                <i className="bi bi-envelope me-2 text-primary"></i>Email Address *
                                            </label>
                                            {isEditing ? (
                                                <>
                                                    <div className="input-group">
                                                        <span className="input-group-text border-end-0 rounded-start-3" style={{ backgroundColor: 'var(--bs-secondary-bg)', borderColor: 'var(--bs-border-color)' }}>
                                                            <i className="bi bi-envelope text-muted"></i>
                                                        </span>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className="form-control border-start-0 rounded-end-3 py-3"
                                                            style={{ 
                                                                backgroundColor: 'var(--bs-secondary-bg)', 
                                                                borderColor: 'var(--bs-border-color)',
                                                                color: '#ffffff',
                                                                cursor: 'not-allowed',
                                                                fontSize: '1rem'
                                                            }}
                                                            title="Email cannot be changed"
                                                            readOnly
                                                            required
                                                        />
                                                    </div>
                                                    <small className="mt-1 d-block" style={{ color: '#ffffff' }}>
                                                        <i className="bi bi-info-circle me-1"></i>Email address cannot be changed
                                                    </small>
                                                </>
                                            ) : (
                                                <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#000000', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)' }}>
                                                    <i className="bi bi-envelope me-2 text-primary"></i>
                                                    <span style={{ color: '#000000' }}>{user.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#000000' }}>
                                                <i className="bi bi-telephone me-2 text-primary"></i>Phone Number
                                            </label>
                                            {isEditing ? (
                                                <div className="input-group">
                                                    <span className="input-group-text border-end-0 rounded-start-3" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)' }}>
                                                        <i className="bi bi-telephone text-primary"></i>
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter phone number"
                                                        className="form-control border-start-0 rounded-end-3 py-3"
                                                        style={{ 
                                                            backgroundColor: 'var(--bs-body-bg)', 
                                                            borderColor: 'var(--bs-border-color)',
                                                            color: '#212529',
                                                            fontSize: '1rem'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#000000', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)' }}>
                                                    <i className="bi bi-telephone me-2 text-primary"></i>
                                                    <span style={{ color: '#212529' }}>{user.phone || 'Click edit to add phone number'}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#212529' }}>
                                                <i className="bi bi-geo-alt me-2 text-primary"></i>Location
                                            </label>
                                            {isEditing ? (
                                                <div className="input-group">
                                                    <span className="input-group-text border-end-0 rounded-start-3" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)' }}>
                                                        <i className="bi bi-geo-alt text-primary"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your city/area"
                                                        className="form-control border-start-0 rounded-end-3 py-3"
                                                        style={{ 
                                                            backgroundColor: 'var(--bs-body-bg)', 
                                                            borderColor: 'var(--bs-border-color)',
                                                            color: '#212529',
                                                            fontSize: '1rem'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#212529', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)' }}>
                                                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                                                    <span style={{ color: '#212529' }}>{user.location || 'Click edit to add location'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information Section */}
                        <div className="col-12 col-xl-6">
                            <div className="card profile-card h-100 border-0 shadow-sm rounded-3 bg-card">
                                <div className="card-body p-4">
                                    <h2 className="h4 fw-semibold mb-4 d-flex align-items-center gradient-text">
                                        <i className="bi bi-shield-lock me-3" style={{ fontSize: '1.5rem' }}></i>Account Information
                                    </h2>
                                    <div className="d-flex flex-column gap-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#212529' }}>
                                                <i className="bi bi-person-badge me-2 text-success"></i>Role
                                            </label>
                                            <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light text-capitalize" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#212529', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)' }}>
                                                <i className="bi bi-person-badge me-2 text-success"></i>
                                                <span className="fw-semibold" style={{ color: '#212529' }}>{user.role}</span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#212529' }}>
                                                <i className="bi bi-calendar-check me-2 text-info"></i>Member Since
                                            </label>
                                            <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#212529', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)' }}>
                                                <i className="bi bi-calendar-check me-2 text-info"></i>
                                                <span style={{ color: '#212529' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                                            </div>
                                        </div>

                                        <div className="mb-0">
                                            <label className="form-label fw-semibold d-flex align-items-center" style={{ color: '#212529' }}>
                                                <i className="bi bi-hash me-2 text-warning"></i>User ID
                                            </label>
                                            <div className="form-control-plaintext rounded-3 px-3 py-3 mb-0 border bg-light font-monospace" style={{ backgroundColor: 'var(--bs-gray-100)', color: '#6c757d', minHeight: '50px', display: 'flex', alignItems: 'center', borderColor: 'var(--bs-border-color)', fontSize: '0.9rem' }}>
                                                <i className="bi bi-hash me-2 text-warning"></i>
                                                <span style={{ color: '#ffffff' }}>{user.id || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}