import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AdminSparkCard = ({ title, value, icon: Icon, color = 'primary', trend, data = [], delay = 0 }) => {
    const isPositive = trend > 0;
    
    // Theme-aware colors for sparklines
    const getStrokeColor = () => {
        switch (color) {
            case 'success': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'danger': return '#ef4444';
            case 'info': return '#06b6d4';
            default: return '#3b82f6';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="glass-card-premium p-4 h-100 position-relative overflow-hidden"
            style={{ minHeight: '160px' }}
        >
            {/* Header Content - Centered for Consistency */}
            <div className="card-body p-4 d-flex flex-column align-items-center text-center position-relative z-index-2">
                <div className={`p-3 rounded-circle mb-3 d-flex align-items-center justify-content-center shadow-sm`}
                     style={{ 
                         background: `${getStrokeColor()}15`,
                         width: '64px',
                         height: '64px',
                         border: '1px solid rgba(255, 255, 255, 0.6)',
                         boxShadow: 'inset 0 0 12px rgba(255,255,255,0.4)',
                         color: getStrokeColor()
                     }}>
                    <Icon size={28} />
                </div>

                <div>
                    <p className="text-uppercase fw-700 text-muted mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                        {title}
                    </p>
                    <h2 className="display-6 fw-bold mb-0" style={{ color: '#0f172a', fontWeight: '900', letterSpacing: '-1.5px' }}>
                        {value}
                    </h2>
                    {trend !== undefined && (
                        <div className={`d-flex align-items-center justify-content-center gap-1 mt-2 px-2 py-1 rounded-pill bg-${isPositive ? 'success' : 'danger'} bg-opacity-25`} style={{ fontSize: '0.65rem' }}>
                            {isPositive ? <TrendingUp size={12} className="text-success text-darken-2" /> : <TrendingDown size={12} className="text-danger text-darken-2" />}
                            <span className={`fw-bold text-${isPositive ? 'success' : 'danger'}`} style={{ filter: 'brightness(0.7)' }}>
                                {isPositive ? '+' : ''}{trend}%
                            </span>
                        </div>
                    )}
                </div>
            </div>

        </motion.div>
    );
};



export default AdminSparkCard;
