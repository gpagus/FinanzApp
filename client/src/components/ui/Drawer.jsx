import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children, position = 'right' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Determinar clases según la posición
    const drawerPositionClasses = {
        right: 'right-0 translate-x-full',
        left: 'left-0 -translate-x-full',
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-screen w-full max-w-md 
                    bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
                    ${isOpen
                    ? 'translate-x-0'
                    : position === 'left' ? '-translate-x-full' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold text-aguazul">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
                    {children}
                </div>
            </div>
        </>
    );
};
export default Drawer;
