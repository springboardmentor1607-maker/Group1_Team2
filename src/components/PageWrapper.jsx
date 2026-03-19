import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`page-wrapper ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1] // Apple-like easing
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
