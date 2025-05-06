import React, { createContext, useContext, useState } from 'react';

const SaldosContext = createContext();

export const SaldosProvider = ({ children }) => {
    const [mostrarSaldos, setMostrarSaldos] = useState(true);

    const toggleMostrarSaldos = () => {
        setMostrarSaldos(prev => !prev);
    };

    return (
        <SaldosContext.Provider value={{ mostrarSaldos, toggleMostrarSaldos }}>
            {children}
        </SaldosContext.Provider>
    );
};

export const useSaldos = () => {
    const context = useContext(SaldosContext);
    if (!context) {
        throw new Error('useSaldos debe usarse dentro de un SaldosProvider');
    }
    return context;
};