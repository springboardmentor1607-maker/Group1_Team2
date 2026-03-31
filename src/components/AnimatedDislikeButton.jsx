import React, { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';

const AnimatedDislikeButton = ({ isDisliked, onClick, count }) => {
    const [scope, animate] = useAnimate();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (isDisliked) {
                animate("#btnOff", { opacity: 0 }, { duration: 0 });
                animate("#btnOn", { opacity: 1 }, { duration: 0 });
                animate("#fb-dislike", { scale: 1, rotate: 0 }, { duration: 0 });
                animate("#hand-wrapper", { rotate: 0, y: 0, x: 0 }, { duration: 0 });
            }
            return;
        }

        if (isDisliked) {
            animate("#btnOff", { opacity: 0 }, { duration: 0.3 });
            animate("#btnOn", { opacity: 1 }, { duration: 0.3 });

            const sequence = [
                ["#fb-dislike", { rotate: -25, scale: 0.8 }, { duration: 0.3, ease: "easeOut" }],
                ["#hand-wrapper", { rotate: -5, y: -10, x: -5 }, { duration: 0.3, ease: "backOut", at: "<" }],
                // Simulated morph via scale/rotate
                ["#fb-dislike", { rotate: 25, scale: 1.2 }, { duration: 0.6, ease: "backOut", at: "-0.45" }],
                ["#hand-wrapper", { rotate: 10, y: 5, x: 15 }, { duration: 0.3, ease: "backOut", at: "-0.45" }],
                ["#fb-dislike", { rotate: 0, scale: 1 }, { duration: 0.6, ease: "backOut", at: "-0.15" }],
                ["#hand-wrapper", { rotate: 0, y: 0, x: 0 }, { duration: 0.3, at: "-0.45" }]
            ];

            try {
                animate(sequence);
            } catch (e) {
                console.warn("Framer motion path interpolation fallback applied.");
            }
        } else {
            animate("#btnOn", { opacity: 0 }, { duration: 0.3 });
            animate("#btnOff", { opacity: 1 }, { duration: 0.3 });
            animate("#fb-dislike", { scale: 1, rotate: 0 }, { duration: 0.3 });
            animate("#hand-wrapper", { rotate: 0, y: 0, x: 0 }, { duration: 0.3 });
        }
    }, [isDisliked, animate]);

    return (
        <motion.button
            ref={scope}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${isDisliked ? 'text-danger' : 'text-secondary'}`}
            style={{
                padding: '0.25rem 0.75rem',
                background: isDisliked ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                border: `1px solid ${isDisliked ? '#ec4899' : 'var(--border-color)'}`,
                transition: 'background 0.3s ease, border 0.3s ease, color 0.3s ease'
            }}
        >
            <div id="wrapper" style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div id="btnOff" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(180deg, #e0e1e5, #babcc5)', zIndex: 1 }} />
                <div id="btnOn" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(180deg, #ec4899, #be185d)', opacity: 0, zIndex: 1 }} />

                {/* Re-use the like SVG but strictly flipped vertically via inline style transform for a "dislike" thumb down */}
                <svg id="fb-dislike" viewBox="0 0 194 178" style={{ width: '16px', height: '16px', zIndex: 2, position: 'relative', pointerEvents: 'none', transform: 'scaleY(-1) scaleX(-1)' }}>
                    <g id="hand-wrapper">
                        <path id="hand" fill="#FFFFFF" d="M119.1,70.1c0,0,20.8-1.2,28.5,0c7.7,1.2,10.3,2,13.8,6.2s2.4,10.5,1.8,12.4c-0.7,1.9-2,3.7-0.2,6s2.5,7.6,1.4,11.9c-1.1,4.2-3.3,6.6-3.3,6.6s0.1,11.1-3.4,16.6c-3.5,5.6-3.3,3.3-3.3,7.7s-3.5,9.2-10.4,11.8s-24,4.5-48.5,4.3c0,0-12.7-0.3-17.9-8.3s-3.8-21.2-3.8-21.2s-0.7-22.5-0.4-25.8s0.4-12.7,10.4-28.2H119.1z" />
                        <path id="thumb" fill="#FFFFFF" d="M82.7,72c0,0,11.4-17.3,11.7-20.7s-0.8-12.8-0.4-18.7s2.3-8.1,9.9-8.2s14.8,5,17.3,13.8s-1.3,20.6-1.3,20.6s-2.1,5.6-2.4,6.8s-2.3,5,1.7,4.8l1.3,0.1" />
                    </g>
                    <path id="arm" fill="#FFFFFF" d="M36.6,150.3c0,0-4.1-2.5-5.9-11.8s-2.1-39.7-1.3-47.2s2.8-12.4,11.4-12.8s12-0.3,14.5,0.6s7,2.1,8,7.1c1,5-1,7.4,0.9,52.2c0,0,1.4,5.8-4.8,11.8S36.6,150.3,36.6,150.3z" />
                </svg>
            </div>
            <span style={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>{count}</span>
        </motion.button>
    );
};

export default AnimatedDislikeButton;
