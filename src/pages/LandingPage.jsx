import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import PublicNavbar from '../components/PublicNavbar';

function LandingPage() {
    const [stats, setStats] = useState({ volunteers: 0, citizens: 0, total: 0 });

    useEffect(() => {
        // Explicitly set body theme to light for the landing page body
        const originalTheme = document.body.getAttribute('data-bs-theme');
        document.body.setAttribute('data-bs-theme', 'light');
        document.body.classList.add('no-scrollbar');

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

        return () => {
            if (originalTheme) {
                document.body.setAttribute('data-bs-theme', originalTheme);
            }
            document.body.classList.remove('no-scrollbar');
        };
    }, []);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
            } 
        }
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

    const scrollReveal = {
        hidden: { opacity: 0, y: 40 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
            } 
        }
    };

    return (
        <div className="landing-page-root w-100 overflow-hidden no-scrollbar" style={{ background: '#000', maxWidth: '100vw' }}>
            <div className="bg-black">
                <PublicNavbar />
            </div>
            
            {/* Hero Section - Explicitly Dark & Seamless */}
            <main className="position-relative overflow-hidden vh-100 d-flex align-items-center" data-bs-theme="dark" style={{ background: '#000' }}>
                {/* Video Background */}
                <div className="hero-video-wrapper">
                    <div className="hero-overlay"></div>
                    <iframe 
                        className="hero-video-iframe"
                        src="https://www.youtube.com/embed/W0LHTWG-UmQ?autoplay=1&mute=1&controls=0&loop=1&playlist=W0LHTWG-UmQ&showinfo=0&rel=0&iv_load_policy=3" 
                        allow="autoplay; encrypted-media"
                        title="City Video Background"
                    ></iframe>
                </div>

                <div className="container h-100 d-flex align-items-center justify-content-center position-relative" style={{ zIndex: 10 }}>
                    <motion.div 
                        className="row align-items-center justify-content-center text-center text-white w-100"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <div className="col-lg-10">
                            <motion.span 
                                variants={fadeInUp}
                                className="badge rounded-pill bg-primary bg-opacity-20 text-white mb-4 px-3 py-2 border border-primary border-opacity-30"
                                style={{ backdropFilter: 'blur(10px)', letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: 'bold' }}
                            >
                                CIVIC ENGAGEMENT REDEFINED
                            </motion.span>
                            
                            <motion.h1 
                                variants={fadeInUp}
                                className="display-1 fw-bold mb-4 tracking-tighter apple-hero-text"
                                style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)', lineHeight: '1.1', opacity: 1 }}
                            >
                                Make Your City<br />
                                Cleaner & Smarter
                            </motion.h1>
                            
                            <motion.p 
                                variants={fadeInUp} 
                                className="lead mb-5 fw-medium mx-auto opacity-75 mt-4 text-white"
                                style={{ maxWidth: '650px', fontSize: '1.4rem', lineHeight: '1.5' }}
                            >
                                Report civic issues, track real-time progress, and build a safer, cleaner community together.
                            </motion.p>
                            
                            <motion.div variants={fadeInUp} className="d-flex flex-wrap justify-content-center gap-4">
                                <Link 
                                    to="/report-issue" 
                                    className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold d-flex align-items-center gap-2 border-0"
                                    style={{ 
                                        background: 'var(--primary-color)',
                                        boxShadow: '0 8px 32px rgba(0, 113, 227, 0.4)',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    Report an Issue
                                </Link>
                                <Link 
                                    to="/complaints" 
                                    className="btn btn-outline-light btn-lg rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 glass-card-premium"
                                    style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '1.1rem' }}
                                >
                                    View Reports
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    allow="visible"
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="position-absolute bottom-0 start-50 translate-middle-x mb-5 text-white opacity-50 d-flex flex-column align-items-center gap-2"
                    style={{ zIndex: 10 }}
                >
                    <small className="fw-bold tracking-widest" style={{ fontSize: '0.6rem' }}>SCROLL TO EXPLORE</small>
                    <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, white, transparent)' }}></div>
                </motion.div>
            </main>

            {/* Rest of the page in white background */}
            <div style={{ background: '#f8fafc' }}>
                {/* How CleanStreet Works Section */}
                <section id="how-it-works" className="py-5 bg-white position-relative" data-bs-theme="light" style={{ zIndex: 1 }}>
                    <div className="container py-5 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={scrollReveal}
                            className="mb-5"
                        >
                            <h2 className="fw-bold display-4 text-dark mb-3 tracking-tight">How CleanStreet Works</h2>
                            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '600px' }}>
                                Join thousands of citizens making an impact every day through our simplified civic reporting framework.
                            </p>
                        </motion.div>

                        <div className="row g-5 mt-4">
                            <motion.div 
                                className="col-md-4"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={scrollReveal}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="h-100 p-5 rounded-premium glass-card-light border-0 shadow-sm">
                                    <div className="d-inline-flex p-4 rounded-circle bg-primary bg-opacity-10 mb-4 text-primary">
                                        <i className="bi bi-megaphone-fill display-6"></i>
                                    </div>
                                    <h3 className="fw-bold mb-3 text-dark">Report Issues</h3>
                                    <p className="text-muted leading-relaxed">
                                        Easily document civic problems with AI-assisted location tagging and photo evidence.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="col-md-4"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={scrollReveal}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="h-100 p-5 rounded-premium glass-card-light border-0 shadow-sm">
                                    <div className="d-inline-flex p-4 rounded-circle bg-info bg-opacity-10 mb-4 text-info">
                                        <i className="bi bi-clock-history display-6"></i>
                                    </div>
                                    <h3 className="fw-bold mb-3 text-dark">Track Progress</h3>
                                    <p className="text-muted leading-relaxed">
                                        Follow your reports through stages from "Pending" to "Resolved" with real-time notifications.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="col-md-4"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={scrollReveal}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="h-100 p-5 rounded-premium glass-card-light border-0 shadow-sm">
                                    <div className="d-inline-flex p-4 rounded-circle bg-warning bg-opacity-10 mb-4 text-warning">
                                        <i className="bi bi-people-fill display-6"></i>
                                    </div>
                                    <h3 className="fw-bold mb-3 text-dark">Community Link</h3>
                                    <p className="text-muted leading-relaxed">
                                        Upvote critical issues and join forces with local volunteers to prioritize community needs.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Active Community Stats Section */}
                <section id="stats" className="py-5 stats-gradient-bg" data-bs-theme="light" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="container py-5">
                        <div className="row align-items-center g-5 justify-content-between">
                            <motion.div 
                                className="col-lg-5"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={scrollReveal}
                            >
                                <div className="position-relative p-2 bg-white rounded-premium shadow-lg">
                                    <img 
                                        src="/hero.png" 
                                        alt="Community Cleaning Initiative" 
                                        className="img-fluid rounded-premium w-100"
                                        style={{ 
                                            objectFit: 'cover',
                                            aspectRatio: '5/6',
                                        }}
                                    />
                                    <motion.div 
                                        className="position-absolute bottom-0 start-0 m-4 glass-card-light p-4 rounded-premium shadow-lg text-center"
                                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                        viewport={{ once: true }}
                                        style={{ minWidth: '220px', border: '1px solid rgba(255,255,255,1)' }}
                                    >
                                        <h3 className="fw-bolder mb-0 text-primary display-4" style={{ letterSpacing: '-0.02em' }}>{stats.total}+</h3>
                                        <p className="text-muted small mb-0 fw-bold text-uppercase tracking-widest mt-1">Impactful Members</p>
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="col-lg-6"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={scrollReveal}
                            >
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-4 py-2 fw-bold shadow-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>✨ JOIN THE MOVEMENT</span>
                                </div>
                                <h2 className="fw-bold mb-4 display-4 text-dark tracking-tight leading-tight">Our Growing <br/><span className="text-primary">Community Impact</span></h2>
                                <p className="text-muted fs-5 mb-5 leading-relaxed">
                                    CleanStreet isn't just an app; it's a movement bridging the gap between civic problems and collective action. Empowering every citizen to be an agent of change.
                                </p>
                                
                                <div className="row g-4">
                                    <div className="col-sm-6">
                                        <div className="glass-card-light p-4 rounded-premium border-0 shadow-sm text-center h-100 d-flex flex-column justify-content-center align-items-center">
                                            <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 mb-3 text-primary">
                                                <i className="bi bi-people-fill fs-3"></i>
                                            </div>
                                            <h2 className="fw-bold mb-1 display-5 text-dark tracking-tighter">{stats.citizens}</h2>
                                            <p className="text-muted fw-bold small mb-0 opacity-75 text-uppercase tracking-wider">Registered Citizens</p>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="glass-card-light p-4 rounded-premium border-0 shadow-sm text-center h-100 d-flex flex-column justify-content-center align-items-center">
                                            <div className="d-inline-flex p-3 rounded-circle bg-info bg-opacity-10 mb-3 text-info">
                                                <i className="bi bi-heart-fill fs-3"></i>
                                            </div>
                                            <h2 className="fw-bold mb-1 display-5 text-dark tracking-tighter">{stats.volunteers}</h2>
                                            <p className="text-muted fw-bold small mb-0 opacity-75 text-uppercase tracking-wider">Verified Volunteers</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default LandingPage;
