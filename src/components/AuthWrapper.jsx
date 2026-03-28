import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthWrapper = ({ children, mode }) => {
    const isLogin = mode === 'login';

    const panelVariants = {
        login: {
            x: '0%',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        },
        signup: {
            x: '100%',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const formVariants = {
        login: {
            x: '0%',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        },
        signup: {
            x: '-100%',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative', overflow: 'hidden', height: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
            {/* Global Brand Header for Auth Pages */}
            <div className="position-fixed top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center" style={{ zIndex: 1000 }}>
                <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none transition-all hover-opacity-80">
                    <div className="rounded-2 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', background: 'var(--hero-gradient)' }}>
                        <span className="text-white fw-bold fs-5">CS</span>
                    </div>
                    <span className="fw-bold fs-4 text-white" style={{ letterSpacing: '-0.02em', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))' }}>CleanStreet</span>
                </Link>
                <Link to="/" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold shadow-sm" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
                    Back to Home
                </Link>
            </div>
            {/* Shared Background Mesh (Universal) */}
            <div className="mesh-background" style={{ opacity: 0.6 }}>
                <div className="mesh-sphere" style={{ width: '600px', height: '600px', background: 'rgba(0, 113, 227, 0.15)', top: '-10%', right: '-10%', animation: 'meshFloat 20s infinite' }}></div>
                <div className="mesh-sphere" style={{ width: '500px', height: '500px', background: 'rgba(138, 180, 248, 0.1)', bottom: '-10%', left: '-10%', animation: 'meshFloat 25s infinite reverse' }}></div>
                <div className="mesh-sphere" style={{ width: '400px', height: '400px', background: 'rgba(66, 133, 244, 0.05)', top: '40%', left: '30%', animation: 'meshFloat 15s infinite' }}></div>
            </div>

            {/* Visual Panel */}
            <motion.div 
                className="auth-visual-side"
                variants={panelVariants}
                animate={mode}
                initial={false}
                style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '4rem',
                    color: 'white',
                    background: '#0a0e1a',
                    boxShadow: '20px 0 60px rgba(0,0,0,0.3)'
                }}
            >
                <motion.div
                    className="auth-visual-bg-wrapper"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}
                >
                    <motion.img 
                        src="/assets/images/auth-bg.png" 
                        alt="Pristine Nature"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                        animate={{ scale: [1, 1.08, 1], rotate: [0, 1, 0] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="auth-visual-overlay" style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundImage: 'url("/Users/gnaneshwar/.gemini/antigravity/brain/34a1a2db-5487-4e0a-9c2c-b044fc9e176c/community_cleaning_street_1774014675532.png")',
                    }}></div>
                </motion.div>

                <motion.div 
                    className="auth-visual-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={mode + '-content'}
                    transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}
                >
                    <div className="mb-5 d-inline-block p-4 rounded-5 glass-card-premium" style={{ 
                        border: '1px solid rgba(255,255,255,0.4)', 
                        background: 'rgba(255,255,255,0.15)',
                        boxShadow: '0 0 40px rgba(0, 113, 227, 0.3)'
                    }}>
                        <span className="h1 fw-bold text-white mb-0" style={{ letterSpacing: '-0.05em', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' }}>CS</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h2 className="display-3 fw-bold mb-4 text-white" style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}>
                                {isLogin ? 'CleanStreet' : 'Join the\nMovement'}
                            </h2>
                            <p className="lead text-white-50 mb-0 px-4" style={{ fontSize: '1.25rem', fontWeight: 400, opacity: 0.8 }}>
                                {isLogin 
                                    ? 'Your journey to a cleaner, greener community starts with a single step.' 
                                    : 'Together, we can build a more beautiful and sustainable future for our community.'
                                }
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {/* Form Panel Container */}
            <div className="auth-form-side-container" style={{ width: '100%', height: '100%', display: 'flex' }}>
                {/* Spacer for the visual panel */}
                <div style={{ width: '50%' }}></div>
                
                {/* Actual Form Panel */}
                <motion.div 
                    className="auth-form-side"
                    variants={formVariants}
                    animate={mode}
                    initial={false}
                    style={{ 
                        width: '50%', 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    <motion.div 
                        key={mode}
                        initial={{ opacity: 0, x: isLogin ? 30 : -30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="auth-card-container"
                        style={{ width: '100%', maxWidth: isLogin ? '460px' : '580px' }}
                    >
                        <div className="glass-card-premium p-4 p-md-5">
                            <h3 className="display-6 fw-bold text-center mb-5 apple-gradient-text" style={{ fontSize: '2rem' }}>
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h3>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthWrapper;
