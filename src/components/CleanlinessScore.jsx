import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
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
                <span className="fs-2 fw-bold text-body">{value}%</span>
                <span className="small text-body-secondary text-uppercase fw-semibold">Clean</span>
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
            className="card border-0 shadow-lg p-4 rounded-xl h-100 d-flex flex-column align-items-center justify-content-center"
        >
            <h3 className="fs-5 fw-semibold text-body mb-4 align-self-start">Cleanliness Score</h3>
            <CircularProgress value={score} />
            <p className="mt-4 text-center small text-body-secondary">
                Based on resolved complaints vs total reports in your area.
            </p>
        </motion.div>
    );
}
