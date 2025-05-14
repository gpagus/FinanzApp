import React from 'react';

const ProgressBar = ({ porcentaje, className = '', bgClassName = 'bg-neutral-200' }) => {
    return (
        <div className={`w-full h-2 rounded-full ${bgClassName}`}>
            <div
                className={`h-2 rounded-full ${className}`}
                style={{ width: `${porcentaje}%` }}
            />
        </div>
    );
};

export default ProgressBar;