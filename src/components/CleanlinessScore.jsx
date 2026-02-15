import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    // Responsive sizing
    const responsiveSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : size;
    const responsiveStrokeWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 8 : strokeWidth;
    const responsiveRadius = (responsiveSize - responsiveStrokeWidth) / 2;

    return (
        <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: responsiveSize, height: responsiveSize }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-secondary opacity-25"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="text-primary"
                />
            </svg>
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                <span className="display-4 fw-bold" style={{ color: 'var(--bs-body-color)' }}>{value}%</span>
                <span className="small text-uppercase fw-semibold" style={{ color: 'var(--bs-secondary-color)' }}>Clean</span>
            </div>
        </div>
    );
};

export default function CleanlinessScore({ score }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="card shadow-lg border p-4 h-100 d-flex flex-column align-items-center justify-content-center bg-card"
        >
            <h3 className="card-title fs-5 fw-semibold mb-4 align-self-start" style={{ color: 'var(--bs-body-color)' }}>Cleanliness Score</h3>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <CircularProgress value={score} />
            </div>
            <p className="mt-3 text-center small mb-0" style={{ color: 'var(--bs-secondary-color)' }}>
                Based on resolved complaints vs total reports in your area.
            </p>
        </motion.div>
    );
}
