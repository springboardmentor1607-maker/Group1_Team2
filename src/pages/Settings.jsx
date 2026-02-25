import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Settings() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: true
    });

    return (
        <div className="container-lg px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="display-5 fw-bold mb-2" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--accent-1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <i className="bi bi-gear me-3"></i>Settings
                </h1>
                <p className="text-muted mb-4">Manage your account preferences and settings</p>

                <div className="row g-4">
                    {/* Notifications Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm rounded-3 h-100" style={{ background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <h3 className="h5 fw-semibold mb-4">
                                    <i className="bi bi-bell me-2 text-primary"></i>Notifications
                                </h3>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-0 fw-medium">Email Notifications</p>
                                            <small className="text-muted">Receive updates via email</small>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={notifications.email}
                                                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-0 fw-medium">Push Notifications</p>
                                            <small className="text-muted">Get push notifications</small>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={notifications.push}
                                                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-0 fw-medium">SMS Notifications</p>
                                            <small className="text-muted">Receive text messages</small>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={notifications.sms}
                                                onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm rounded-3 h-100" style={{ background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <h3 className="h5 fw-semibold mb-4">
                                    <i className="bi bi-shield-lock me-2 text-primary"></i>Privacy
                                </h3>
                                <div className="d-flex flex-column gap-3">
                                    <button className="btn btn-outline-primary text-start rounded-3">
                                        <i className="bi bi-key me-2"></i>Change Password
                                    </button>
                                    <button className="btn btn-outline-primary text-start rounded-3">
                                        <i className="bi bi-lock me-2"></i>Two-Factor Authentication
                                    </button>
                                    <button className="btn btn-outline-danger text-start rounded-3">
                                        <i className="bi bi-trash me-2"></i>Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
export default Settings;