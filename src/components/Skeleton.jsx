import React from 'react';

const Skeleton = ({ width, height, variant = 'text', className = '', style = {} }) => {
    const baseStyle = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
        ...style
    };

    let variantClass = '';
    if (variant === 'circle') variantClass = 'skeleton-circle';
    if (variant === 'title') variantClass = 'skeleton-title';
    if (variant === 'text') variantClass = 'skeleton-text';

    return (
        <div 
            className={`skeleton-loading ${variantClass} ${className}`} 
            style={baseStyle}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
