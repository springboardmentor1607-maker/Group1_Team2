import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <>
            <PublicNavbar />
            <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden">
                {/* Background elements inherited from body/index.css but we ensure full height centering here */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-100"
                    style={{ maxWidth: '480px', zIndex: 1 }}
                >
                    <div className="text-center mb-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="d-inline-flex justify-content-center align-items-center mb-4 p-3 rounded-circle glass-card"
                            style={{ 
                                width: '80px', 
                                height: '80px',
                                background: 'rgba(0, 113, 227, 0.1)',
                                border: '1px solid rgba(0, 113, 227, 0.2)'
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 18V26H10V18H6ZM11 15V26H15V15H11ZM16 17V26H20V17H16ZM21 19V26H25V19H21Z" fill="var(--primary-color)" />
                                <path d="M13 13L14 13L14 21L12 21L12 13Z" fill="var(--primary-color)" transform="rotate(-45 14 14)" />
                                <circle cx="20" cy="8" r="1.5" fill="var(--primary-color)" />
                                <circle cx="24" cy="10" r="1" fill="var(--primary-color)" />
                                <circle cx="18" cy="11" r="1" fill="var(--primary-color)" />
                            </svg>
                        </motion.div>
                        <h1 className="fw-bold fs-1 text-body mb-2" style={{ letterSpacing: '-0.04em' }}>CleanStreet</h1>
                        <p className="text-muted fs-5">{subtitle || "Civic Issue Tracking Platform"}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </>
    );
};

export default AuthLayout;
