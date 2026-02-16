import React from 'react'

function Logo({ size = 32, textColor = 'inherit' }) {
    return (
        <div className="d-flex align-items-center">
            <svg
                width={size}
                height={size}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-2"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                </defs>

                <rect width="32" height="32" rx="6" fill="url(#logoGradient)" />

                {/* City buildings */}
                <rect x="6" y="18" width="4" height="8" fill="white" opacity="0.9" />
                <rect x="11" y="15" width="4" height="11" fill="white" opacity="0.9" />
                <rect x="16" y="17" width="4" height="9" fill="white" opacity="0.9" />
                <rect x="21" y="19" width="4" height="7" fill="white" opacity="0.9" />

                {/* Broom */}
                <path d="M8 8 L14 14 L12 16 L6 10 Z" fill="white" />
                <rect
                    x="13"
                    y="13"
                    width="2"
                    height="8"
                    rx="1"
                    fill="white"
                    transform="rotate(-45 14 14)"
                />

                {/* Sparkles */}
                <circle cx="20" cy="8" r="1.5" fill="white" />
                <circle cx="24" cy="10" r="1" fill="white" />
                <circle cx="18" cy="11" r="1" fill="white" />
            </svg>

            <span className="brand-text" style={{ color: textColor }}>
                CleanStreet
            </span>
        </div>
    )
}

export default Logo