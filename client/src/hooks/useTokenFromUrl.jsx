import { useEffect, useState } from 'react';

/**
 * Hook personalizado para extraer y verificar un token desde la URL
 * @param {Function} verificationCallback - Función que verifica el token
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoVerify - Si debe verificar automáticamente el token
 * @param {Function} options.onSuccess - Callback a ejecutar cuando la verificación es exitosa
 * @param {Function} options.onError - Callback a ejecutar cuando hay un error
 * @returns {Object} - Estado y funciones relacionadas con el token
 */
const useTokenFromUrl = (verificationCallback, options = {}) => {
    const {
        autoVerify = true,
        onSuccess = () => {},
        onError = () => {},
    } = options;

    const [token, setToken] = useState(null);
    const [tokenError, setTokenError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    // Extraer el token de la URL
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const urlToken = hashParams.get("token");

        if (!urlToken) {
            setTokenError(true);
            setLoading(false);
            onError();
        } else {
            setToken(urlToken);

            // Si autoVerify está activado, verifica el token automáticamente
            if (autoVerify && verificationCallback) {
                verifyToken(urlToken);
            } else {
                setLoading(false);
            }
        }
    }, []);

    // Función para verificar el token
    const verifyToken = async (tokenToVerify = token) => {
        if (!tokenToVerify) {
            setTokenError(true);
            setLoading(false);
            onError();
            return false;
        }

        setLoading(true);
        try {
            const result = await verificationCallback(tokenToVerify);
            setLoading(false);

            if (result) {
                setSuccess(true);
                onSuccess(result);
                return true;
            } else {
                setTokenError(true);
                onError();
                return false;
            }
        } catch (error) {
            setLoading(false);
            setTokenError(true);
            onError(error);
            return false;
        }
    };

    return {
        token,
        tokenError,
        loading,
        success,
        verifyToken,
        setTokenError,
        setSuccess
    };
};

export default useTokenFromUrl;