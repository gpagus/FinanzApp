import { Euro, Loader } from 'lucide-react';
import Boton from '../Boton.jsx';
import FormField from '../FormField.jsx';

const CuentaForm = ({
                        mostrar,
                        cuentaSeleccionada,
                        nuevaCuenta,
                        errores,
                        isSubmitting,
                        opcionesTiposCuenta,
                        onInputChange,
                        onSubmit,
                        onClose,
                    }) => {
    if (!mostrar) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-aguazul">
                        {cuentaSeleccionada ? 'Editar cuenta' : 'Añadir nueva cuenta'}
                    </h2>
                </div>

                <form onSubmit={onSubmit} className="p-6">
                    <FormField
                        label="Nombre de la cuenta"
                        name="nombre"
                        type="text"
                        value={nuevaCuenta.nombre}
                        onChange={onInputChange}
                        error={errores.nombre}
                        placeholder="Ej: Cuenta Nómina"
                        disabled={isSubmitting}
                    />

                    {!cuentaSeleccionada && (
                        <>
                            <FormField
                                label="Tipo de cuenta"
                                name="tipo"
                                type="select"
                                value={nuevaCuenta.tipo}
                                onChange={onInputChange}
                                error={errores.tipo}
                                options={opcionesTiposCuenta}
                                disabled={isSubmitting}
                            />

                            <FormField
                                label="Saldo inicial"
                                name="balance"
                                type="number"
                                value={nuevaCuenta.balance}
                                onChange={onInputChange}
                                error={errores.balance}
                                placeholder="0.00"
                                step="0.01"
                                prefix={<Euro size={16} className="text-neutral-600" />}
                                hint="Use valores negativos para deudas o tarjetas de crédito"
                                disabled={isSubmitting}
                            />
                        </>
                    )}

                    <div className="flex justify-end space-x-3">
                        <Boton tipo="texto" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Boton>
                        <Boton tipo="primario" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader size={16} className="animate-spin mr-2" />
                                    {cuentaSeleccionada ? 'Guardando...' : 'Añadiendo...'}
                                </>
                            ) : (
                                cuentaSeleccionada ? 'Guardar cambios' : 'Añadir cuenta'
                            )}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CuentaForm;