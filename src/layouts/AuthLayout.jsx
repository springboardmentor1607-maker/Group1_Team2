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
                    style={{ maxWidth: '480px', zIndex: 1, marginTop: '70px' }}
                >
                    <div className="text-center mb-4">
                        <div className="d-flex justify-content-center mb-3">
                            <div className="p-3 rounded-4 bg-gradient-to-br from-green-500 to-teal-500 shadow-lg" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)' }}>
                                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 18V26H10V18H6ZM11 15V26H15V15H11ZM16 17V26H20V17H16ZM21 19V26H25V19H21Z" fill="white" />
                                    <path d="M13 13L14 13L14 21L12 21L12 13Z" fill="white" transform="rotate(-45 14 14)" />
                                    <circle cx="20" cy="8" r="1.5" fill="white" />
                                    <circle cx="24" cy="10" r="1" fill="white" />
                                    <circle cx="18" cy="11" r="1" fill="white" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="fw-bold fs-2 text-body mb-2">CleanStreet</h1>
                        <p className="text-muted">{subtitle || "Civic Issue Tracking Platform"}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </>
    );
};

export default AuthLayout;
