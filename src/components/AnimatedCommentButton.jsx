import React, { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const AnimatedCommentButton = ({ isActive, onClick, count }) => {
    const [scope, animate] = useAnimate();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (isActive) {
                animate("#btnOff", { opacity: 0 }, { duration: 0 });
                animate("#btnOn", { opacity: 1 }, { duration: 0 });
                animate("#comment-icon", { scale: 1.1 }, { duration: 0 });
            }
            return;
        }

        if (isActive) {
            animate("#btnOff", { opacity: 0 }, { duration: 0.3 });
            animate("#btnOn", { opacity: 1 }, { duration: 0.3 });

            const sequence = [
                ["#comment-icon", { scale: 0.8, rotate: -15 }, { duration: 0.2, ease: "easeOut" }],
                ["#comment-icon", { scale: 1.2, rotate: 15 }, { duration: 0.3, ease: "backOut" }],
                ["#comment-icon", { scale: 1.1, rotate: 0 }, { duration: 0.3, ease: "backOut" }]
            ];

            try {
                animate(sequence);
            } catch (e) {
                console.warn("Framer motion animation failed.");
            }
        } else {
            animate("#btnOn", { opacity: 0 }, { duration: 0.3 });
            animate("#btnOff", { opacity: 1 }, { duration: 0.3 });
            animate("#comment-icon", { scale: 1, rotate: 0 }, { duration: 0.3 });
        }
    }, [isActive, animate]);

    return (
        <motion.button
            ref={scope}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${isActive ? 'text-info' : 'text-secondary'}`}
            style={{
                padding: '0.25rem 0.75rem',
                background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                border: `1px solid ${isActive ? '#06b6d4' : 'var(--border-color)'}`,
                transition: 'background 0.3s ease, border 0.3s ease, color 0.3s ease'
            }}
        >
            <div id="wrapper" style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div id="btnOff" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(180deg, #e0e1e5, #babcc5)', zIndex: 1 }} />
                <div id="btnOn" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(180deg, #06b6d4, #0891b2)', opacity: 0, zIndex: 1 }} />

                <div id="comment-icon" style={{ zIndex: 2, position: 'relative', display: 'flex', color: '#ffffff' }}>
                    <MessageSquare size={16} strokeWidth={2.5} />
                </div>
            </div>
            <span style={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>{count}</span>
        </motion.button>
    );
};

export default AnimatedCommentButton;
