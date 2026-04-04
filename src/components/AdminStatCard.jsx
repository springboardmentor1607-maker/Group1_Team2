import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AdminStatCard = ({ title, value, icon: Icon, color, trend, delay }) => {
    const isPositive = trend > 0;
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card-premium p-4 h-100 position-relative overflow-hidden"
            style={{ 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px) saturate(180%)'
            }}
        >
            {/* Background Glow */}
            <div className="position-absolute top-0 end-0 p-3 opacity-5">
                <Icon size={80} />
            </div>


            <div className="d-flex flex-column h-100 justify-content-between">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg d-flex align-items-center justify-content-center ${color}`}
                         style={{ 
                             width: '48px', 
                             height: '48px',
                             borderRadius: '12px',
                             boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                         }}>
                        <Icon size={24} />
                    </div>
                    <p className="text-muted small fw-bold text-uppercase tracking-widest mb-0" style={{ fontSize: '0.7rem' }}>
                        {title}
                    </p>
                </div>

                <div className="d-flex align-items-end justify-content-between mt-auto">
                    <div>
                        <h2 className="display-6 fw-bold mb-0 apple-gradient-text">
                            {value}
                        </h2>
                    </div>
                    
                    {trend !== undefined && (
                        <div className={`d-flex align-items-center gap-1 small fw-bold ${isPositive ? 'text-success' : 'text-danger'}`}
                             style={{ padding: '4px 8px', borderRadius: '20px', background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', background: `var(--bs-${color.split(' ')[0].replace('bg-', '')})`, opacity: 0.6 }} />
        </motion.div>
    );
};

export default AdminStatCard;
