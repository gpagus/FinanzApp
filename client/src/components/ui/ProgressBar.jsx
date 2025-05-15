import React from 'react';

const ProgressBar = ({ porcentaje, className = '', bgClassName = 'bg-neutral-200' }) => {
    return (
        <div className={`w-full h-3.5 rounded-full relative ${bgClassName}`}>
            <div
                className={`h-3.5 rounded-full ${className} relative group cursor-pointer`}
                style={{ width: `${porcentaje}%` }}
            >
                <span className="tooltip">{porcentaje.toFixed(2)}%</span>
            </div>
        </div>
    );
};

export default ProgressBar;