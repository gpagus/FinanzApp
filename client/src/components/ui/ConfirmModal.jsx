import {AlertTriangle, Loader, X} from 'lucide-react';
import Boton from './Boton';

const ConfirmModal = ({
                          isOpen,
                          onClose,
                          onConfirm,
                          title,
                          message,
                          confirmLabel = 'Confirmar',
                          cancelLabel = 'Cancelar',
                          isWaiting = false
                      }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-aguazul flex items-center">
                        <AlertTriangle size={20} className="mr-2 text-error"/>
                        {title}
                    </h2>
                    <Boton
                        tipo="icono"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        disabled={isWaiting}
                    >
                        <X size={20} className="text-neutral-600"/>
                    </Boton>
                </div>
                <div className="p-6">
                    <p className="text-neutral-700">{message}</p>
                </div>
                <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
                    <Boton
                        tipo="texto"
                        onClick={onClose}
                        disabled={isWaiting}
                    >
                        {cancelLabel}
                    </Boton>
                    <Boton
                        tipo="primario"
                        onClick={onConfirm}
                        disabled={isWaiting}
                        className="bg-error text-white hover:bg-error/80"
                    >
                        {isWaiting ? (
                            <>
                                <Loader size={16} className="animate-spin mr-2"/>
                                Procesando...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Boton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;