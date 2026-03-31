import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthWrapper = ({ children, mode }) => {
    const isLogin = mode === 'login';

    const panelVariants = {
        login: { 
            x: 0, 
            borderRadius: '0 40px 40px 0',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        },
        signup: { 
            x: '100%', 
            borderRadius: '40px 0 0 40px',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const formVariants = {
        login: { 
            x: 0, 
            opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        },
        signup: { 
            x: '-100%', 
            opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
            {/* Background Mesh */}
            <div className="mesh-background" style={{ opacity: 0.4 }}>
                <div className="mesh-sphere" style={{ width: '600px', height: '600px', background: 'rgba(0, 113, 227, 0.08)', top: '-10%', left: '-10%' }}></div>
                <div className="mesh-sphere" style={{ width: '500px', height: '500px', background: 'rgba(43, 192, 228, 0.08)', bottom: '-10%', right: '-10%' }}></div>
            </div>

            {/* Visual Side (Hidden on mobile) */}
            <motion.div 
                className="auth-visual-side d-none d-lg-flex"
                variants={panelVariants}
                animate={mode}
                initial={isLogin ? "login" : "signup"}
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '50%', 
                    height: '100%', 
                    zIndex: 20, 
                    boxShadow: '20px 0 50px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <div className="auth-visual-overlay" style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
                    zIndex: 1
                }}></div>
                <motion.img 
                    src="/assets/images/auth-bg.png" 
                    alt="Auth Visual" 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        filter: 'brightness(0.8) contrast(1.1)'
                    }} 
                />
                
                <div className="auth-visual-content" style={{ position: 'relative', zIndex: 10, padding: '4rem', textAlign: 'center', color: 'white' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h2 className="display-4 fw-bold mb-4 tracking-tighter" style={{ 
                            color: '#ffffff', 
                            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                            whiteSpace: 'pre-line' 
                        }}>
                            {isLogin ? 'CleanStreet' : 'Join the\nMovement'}
                        </h2>
                        <p className="lead fw-medium opacity-90 mb-0 px-4" style={{ 
                            lineHeight: '1.6', 
                            maxWidth: '450px', 
                            margin: '0 auto',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            {isLogin 
                                ? 'Your gateway to a cleaner, smarter city. Manage reports and make a difference.' 
                                : 'Together, we can build a more beautiful and sustainable future for our community.'}
                        </p>
                    </motion.div>
                </div>

                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-5" style={{ zIndex: 10 }}>
                    <div className="d-flex gap-2">
                        <div className={`rounded-circle ${isLogin ? 'bg-white' : 'bg-white opacity-40'}`} style={{ width: '8px', height: '8px' }}></div>
                        <div className={`rounded-circle ${!isLogin ? 'bg-white' : 'bg-white opacity-40'}`} style={{ width: '8px', height: '8px' }}></div>
                    </div>
                </div>
            </motion.div>

            {/* Form Side Container */}
            <div className="auth-form-side-container" style={{ width: '100%', minHeight: '100vh', display: 'flex' }}>
                <div className="d-none d-lg-block" style={{ width: '50%' }}></div>
                
                <motion.div 
                    className="auth-form-side"
                    variants={formVariants}
                    animate={mode}
                    initial={isLogin ? "login" : "signup"}
                    style={{ 
                        width: '100%',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 2rem',
                        position: 'relative',
                        zIndex: 10,
                        overflowY: 'auto'
                    }}
                >
                    <div className="position-absolute top-0 end-0 p-4" style={{ zIndex: 30 }}>
                        <Link to="/" className="text-decoration-none fw-semibold tracking-tight p-2 px-3 rounded-pill glass-surface transition-all" 
                              style={{ 
                                  fontSize: '0.85rem', 
                                  color: 'var(--text-primary)', 
                                  background: 'var(--bg-card)', 
                                  border: '1px solid var(--border-glass)' 
                              }}>
                            <i className="bi bi-house-door me-2"></i>Back to Home
                        </Link>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-card-premium w-100" 
                        style={{ 
                            maxWidth: isLogin ? '480px' : '640px', 
                            padding: '3.5rem 2.5rem'
                        }}
                    >
                        <div className="text-center mb-5">
                            <span className="badge rounded-pill px-3 py-2 mb-3 shadow-sm" style={{ background: 'rgba(0, 113, 227, 0.1)', color: '#0071e3', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {isLogin ? 'Welcome Back' : 'Get Started'}
                            </span>
                            <h1 className="display-6 fw-bold text-gradient-premium tracking-tighter" style={{ fontSize: '2.2rem' }}>
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </h1>
                        </div>

                        {children}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthWrapper;
