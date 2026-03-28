import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PublicNavbar from '../components/PublicNavbar';

function LandingPage() {
    const [stats, setStats] = useState({ volunteers: 0, citizens: 0, total: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/auth/stats');
                if (res.success && res.stats) {
                    setStats(res.stats);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column bg-white">
            <PublicNavbar />

            {/* Hero Section */}
            <main className="flex-grow-1 position-relative overflow-hidden" style={{ minHeight: '600px' }}>
                {/* Video Background */}
                <div 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ zIndex: 0 }}
                >
                    <div 
                        className="position-absolute top-0 start-0 w-100 h-100" 
                        style={{ 
                            background: 'rgba(30, 60, 114, 0.6)', /* Blue-ish dark overlay to ensure text readability */
                            zIndex: 1 
                        }} 
                    />
                    <iframe 
                        src="https://www.youtube.com/embed/W0LHTWG-UmQ?autoplay=1&mute=1&controls=0&loop=1&playlist=W0LHTWG-UmQ&showinfo=0&rel=0&iv_load_policy=3" 
                        style={{ 
                            width: '100vw', 
                            height: '56.25vw', /* 16:9 Aspect Ratio */
                            minHeight: '100vh', 
                            minWidth: '177.77vh', /* 16:9 Aspect Ratio */
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)', 
                            pointerEvents: 'none',
                            border: 'none'
                        }}
                        allow="autoplay; encrypted-media"
                        title="City Video Background"
                    ></iframe>
                </div>

                <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
                    <motion.div 
                        className="row align-items-center justify-content-center text-center text-white py-5 my-5"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <div className="col-lg-8 z-2">
                            <motion.h1 
                                variants={fadeInUp} 
                                className="display-4 fw-bold mb-3" 
                                style={{ letterSpacing: '-0.02em' }}
                            >
                                Make Your City Cleaner & Smarter
                            </motion.h1>
                            
                            <motion.p 
                                variants={fadeInUp} 
                                className="lead mb-5 fw-normal"
                                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                                Report civic issues, track progress, and help build a better community together.
                            </motion.p>
                            
                            <motion.div variants={fadeInUp} className="d-flex flex-wrap justify-content-center gap-3">
                                <Link 
                                    to="/report-issue" 
                                    className="btn btn-light btn-lg rounded-pill px-4 shadow-lg fw-semibold d-flex align-items-center"
                                    style={{ color: '#2b5876', border: 'none' }}
                                >
                                    <i className="bi bi-plus-lg me-2"></i> Report an Issue
                                </Link>
                                <Link 
                                    to="/complaints" 
                                    className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold d-flex align-items-center glass-card"
                                    style={{ border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}
                                >
                                    <i className="bi bi-eye me-2"></i> View Reports
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* How CleanStreet Works Section */}
            <section className="py-5 bg-white">
                <div className="container py-5 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-5"
                    >
                        <h2 className="fw-bold fs-2 text-dark mb-2">How CleanStreet Works</h2>
                        <p className="text-muted fs-5">Simple steps to make a difference in your community</p>
                    </motion.div>

                    <div className="row g-4 mt-2">
                        {/* Step 1 */}
                        <motion.div 
                            className="col-md-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="p-4 h-100" style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '2rem !important' }}>
                                <i className="bi bi-plus-lg display-5 mb-4" style={{ color: '#007bff' }}></i>
                                <h4 className="fw-bold mb-3 text-dark">Report Issues</h4>
                                <p className="text-muted">Easily report civic problems with photos and location details</p>
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div 
                            className="col-md-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="p-4 h-100" style={{ borderBottom: '2px solid transparent' }}>
                                <i className="bi bi-eye display-5 mb-4" style={{ color: '#007bff' }}></i>
                                <h4 className="fw-bold mb-3 text-dark">Track Progress</h4>
                                <p className="text-muted">Monitor the status of reported issues and see updates in real-time</p>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div 
                            className="col-md-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="p-4 h-100" style={{ borderBottom: '2px solid transparent' }}>
                                <i className="bi bi-heart-fill display-5 mb-4" style={{ color: '#ffb800' }}></i>
                                <h4 className="fw-bold mb-3 text-dark">Community Impact</h4>
                                <p className="text-muted">Vote and comment on issues to help prioritize community needs</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Active Community Stats Section (Premium addition using the requested data) */}
            <section className="py-5" style={{ background: 'var(--bg-primary)' }}>
                <div className="container py-4">
                    <div className="row align-items-center g-5">
                        <motion.div 
                            className="col-lg-6"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="position-relative">
                                <img 
                                    src="/hero.png" 
                                    alt="Community Cleaning Initiative" 
                                    className="img-fluid rounded-4 shadow-lg w-100"
                                    style={{ 
                                        objectFit: 'cover',
                                        aspectRatio: '4/3',
                                        border: '1px solid var(--border-color)'
                                    }}
                                />
                                <motion.div 
                                    className="position-absolute bottom-0 start-0 translate-middle-x glass-card p-3 rounded-4 shadow-lg text-center"
                                    style={{ marginBottom: '10%' }}
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <h3 className="fw-bolder mb-0 text-primary">{stats.total}+</h3>
                                    <p className="text-muted small mb-0 fw-semibold">Active Members</p>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="col-lg-6"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="fw-bold mb-4">A Growing Community</h3>
                            <p className="text-muted fs-5 mb-4">
                                Our platform connects everyday citizens with the city's most dedicated volunteers, turning complaints into collective action.
                            </p>
                            <div className="row g-4 mt-2">
                                <div className="col-sm-6">
                                    <div className="glass-card p-4 rounded-4 text-center h-100">
                                        <div className="d-inline-flex justify-content-center align-items-center p-3 rounded-circle mb-3" style={{ background: 'rgba(0, 113, 227, 0.1)' }}>
                                            <i className="bi bi-people-fill text-primary fs-3"></i>
                                        </div>
                                        <h2 className="fw-bold mb-1 display-5 text-dark">{stats.citizens}</h2>
                                        <p className="text-muted fw-medium mb-0">Citizens Reporting</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="glass-card p-4 rounded-4 text-center h-100">
                                        <div className="d-inline-flex justify-content-center align-items-center p-3 rounded-circle mb-3" style={{ background: 'rgba(43, 192, 228, 0.1)' }}>
                                            <i className="bi bi-heart-fill fs-3" style={{ color: 'var(--accent-1)' }}></i>
                                        </div>
                                        <h2 className="fw-bold mb-1 display-5 text-dark">{stats.volunteers}</h2>
                                        <p className="text-muted fw-medium mb-0">Dedicated Volunteers</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
