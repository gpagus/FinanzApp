import {useState} from 'react';
import {X, EllipsisVertical} from 'lucide-react';
import {toast} from "react-hot-toast";
import useTransacciones from "../../hooks/useTransacciones";
import Boton from '../ui/Boton';
import {formatearMoneda, formatearFecha} from "../../utils/formatters";
import {CATEGORIAS} from "../../utils/constants";
import DropdownMenu from "./DropdownMenu";
import EditarTransaccionForm from "./forms/EditarTransaccionForm";
import ConfirmModal from "./ConfirmModal";

const TransaccionDetailModal = ({transaccion, onClose}) => {

    const {
        agregarTransaccion,
        isAddingTransaccion
    } = useTransacciones({cuentaId: transaccion?.cuenta_id});

    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isRectifyingMode, setIsRectifyingMode] = useState(false);

    if (!transaccion) return null;

    const categoria = CATEGORIAS.find(cat => cat.value === transaccion.categoria_id);
    const fechaFormateada = new Date(transaccion.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const horaFormateada = new Date(new Date(transaccion.fecha).getTime() + 2 * 60 * 60 * 1000)
        .toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

    const acciones = [
        {
            label: 'Editar',
            onClick: () => setIsEditingMode(true),
        },
        {
            label: 'Rectificar',
            onClick: () => setIsRectifyingMode(true),
            className: 'text-red-600',
            disabled: transaccion.transaccion_original_id,
        },
    ];

    const handleEditSuccess = () => {
        setIsEditingMode(false);
        onClose();
    };

    const handleRectificacion = () => {
        // Crear transacción opuesta (rectificación)
        const nuevaTransaccion = {
            cuenta_id: transaccion.cuenta_id,
            monto: transaccion.monto,
            descripcion: `Rectificación: ${transaccion.descripcion || 'Sin descripción'}`,
            fecha: new Date().toISOString(),
            // Si era gasto → ingreso, si era ingreso → gasto
            tipo: transaccion.tipo === 'gasto' ? 'ingreso' : 'gasto',
            // Mantener la misma categoría para facilitar el seguimiento
            categoria_id: transaccion.categoria_id,
            // Referencia a la transacción original (opcional)
            transaccion_original_id: transaccion.id
        };

        // Si es una transferencia, añadir info de cuenta destino
        if (transaccion.cuenta_destino_id) {
            nuevaTransaccion.cuenta_destino_id = transaccion.cuenta_destino_id;
        }

        agregarTransaccion(nuevaTransaccion, {
            onSuccess: () => {
                toast.success('Movimiento rectificado');
                setIsRectifyingMode(false);
                onClose();
            },
            onError: (error) => {
                toast.error(`Error al rectificar: ${error.message}`);
                setIsRectifyingMode(false);
            }
        });
    };

    return (
        <>
            {/* Modal de detalles */}
            {!isEditingMode && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                            <div className="flex items-center">
                                <h3 className="text-lg font-semibold text-aguazul">Detalles de la transacción</h3>
                                <DropdownMenu
                                    triggerIcon={<EllipsisVertical className="text-neutral-400"/>}
                                    actions={acciones}
                                />
                            </div>

                            <Boton tipo="icono" onClick={onClose} aria-label="Cerrar">
                                <X size={20}/>
                            </Boton>
                        </div>

                        <div className="p-4">
                            <div className="flex flex-col mb-4 pb-4 border-b border-neutral-100">
                                <div className="flex items-start mb-3">
                                    <div className="text-2xl mr-3 flex-shrink-0" aria-hidden="true">
                                        {categoria?.icono || '❓'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-medium text-lg break-words">{transaccion.descripcion}</h4>
                                        <p className="text-sm text-neutral-600">{categoria?.label || 'Sin categoría'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <p className={`font-bold text-xl ${transaccion.tipo === 'gasto' ? 'text-error' : 'text-success'}`}>
                                        {transaccion.tipo === 'gasto' ? '-' : '+'}{formatearMoneda(transaccion.monto)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-neutral-600">Fecha</p>
                                    <p className="font-medium">{fechaFormateada} a las {horaFormateada}</p>
                                </div>

                                {transaccion.cuenta && (
                                    <div>
                                        <p className="text-sm text-neutral-600">Cuenta</p>
                                        <p className="font-medium">{transaccion.cuenta.nombre}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-neutral-600">Tipo</p>
                                    <p className="font-medium capitalize">{transaccion.tipo}</p>
                                </div>

                                {transaccion.created_at && (
                                    <div>
                                        <p className="text-sm text-neutral-600">Creado el</p>
                                        <p className="font-medium">{formatearFecha(transaccion.created_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario de edición como modal separado */}
            <EditarTransaccionForm
                transaccion={transaccion}
                onClose={() => setIsEditingMode(false)}
                onSuccess={handleEditSuccess}
                isVisible={isEditingMode}
            />

            {/* Modal de confirmación para rectificar */}
            <ConfirmModal
                isOpen={isRectifyingMode}
                onClose={() => setIsRectifyingMode(false)}
                onConfirm={handleRectificacion}
                title="Confirmar rectificación"
                message="¿Estás seguro de que deseas rectificar esta transacción?"
                confirmLabel="Rectificar"
                cancelLabel="Cancelar"
                isWaiting={isRectifyingMode && isAddingTransaccion}
            />
        </>
    );
};

export default TransaccionDetailModal;