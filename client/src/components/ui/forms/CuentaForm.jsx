import { Euro, Loader } from 'lucide-react';
import { z } from 'zod';
import useCustomForm from '../../../hooks/useCustomForm';
import Boton from '../Boton';
import FormField from '../FormField';

const cuentaSchema = z.object({
    nombre: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder los 50 caracteres'),
    tipo: z.string()
        .min(1, 'Seleccione un tipo de cuenta'),
    balance: z.coerce.number({
        errorMap: () => ({ message: 'Saldo inválido' }),
    })
    .refine(val => {
        const numString = Math.abs(val).toString();
        return numString.length <= 10;
    }, { message: 'El saldo no puede exceder de 10 dígitos' })
    .default(0),
});

const CuentaForm = ({
    mostrar,
    cuentaSeleccionada,
    onSubmitCuenta,
    onClose,
    opcionesTiposCuenta,
}) => {
    const { register, handleSubmit, errors, isSubmitting } = useCustomForm({
        schema: cuentaSchema,
        onSubmit: onSubmitCuenta,
        defaultValues: cuentaSeleccionada || {}
    });

    if (!mostrar) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-aguazul">
                        {cuentaSeleccionada ? 'Editar cuenta' : 'Añadir nueva cuenta'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <FormField
                        label="Nombre de la cuenta"
                        name="nombre"
                        register={register}
                        error={errors.nombre?.message}
                        placeholder="Ej: Cuenta Nómina"
                        disabled={isSubmitting}
                    />

                    {!cuentaSeleccionada && (
                        <>
                            <FormField
                                label="Tipo de cuenta"
                                name="tipo"
                                type="select"
                                register={register}
                                error={errors.tipo?.message}
                                options={opcionesTiposCuenta.map((tipo) => ({
                                    value: tipo.value,
                                    label: tipo.label,
                                }))}
                                disabled={isSubmitting}
                            />

                            <FormField
                                label="Saldo inicial"
                                name="balance"
                                type="number"
                                step="0.01"
                                prefix={<Euro size={16} className="text-neutral-600" />}
                                hint="Use valores negativos para deudas o tarjetas de crédito"
                                register={register}
                                error={errors.balance?.message}
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
                            ) : cuentaSeleccionada ? 'Guardar cambios' : 'Añadir cuenta'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CuentaForm;