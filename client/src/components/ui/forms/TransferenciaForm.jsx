import {z} from 'zod';
import useCustomForm from '../../../hooks/useCustomForm';
import useTransacciones from '../../../hooks/useTransacciones';
import {useCuentas} from '../../../hooks/useCuentas';
import Boton from '../Boton';
import FormField from '../FormField';
import {Euro} from "lucide-react";

/* --- esquema de validación --- */
const transferenciaSchema = (cuentaId, cuentasDisponibles) =>
    z.object({
        monto: z.coerce.number()
            .positive('Debe ser mayor que 0')
            .max(99999999, 'El monto no puede exceder de los 8 dígitos'),
        cuenta_destino_id: z
            .string()
            .uuid('Seleccione una cuenta válida')
            .refine((id) => id !== cuentaId, {
                message: 'La cuenta destino debe ser distinta a la cuenta origen',
            })
            .refine((id) => cuentasDisponibles.includes(id), {
                message: 'La cuenta destino no es válida',
            }),
        descripcion: z
            .string()
            .min(1, 'Introduzca una descripción')
            .max(50, 'Máximo 50 caracteres'),
        fecha: z
            .coerce
            .date({
                errorMap: () => ({message: 'Introduzca una fecha'}),
            })
            .refine((date) => date <= new Date(), {
                message: 'La fecha no puede ser futura',
            }),
    });

/* ----------------------------------------------------------------- */
export default function TransferenciaForm({
                                              cuentaId,
                                              onSuccess,
                                              onBack,
                                          }) {
    const {agregarTransaccion, isAddingTransaccion} = useTransacciones({cuentaId});
    const {cuentas, isLoading} = useCuentas();

    /* lista de IDs para validar que la cuenta destino exista */
    const cuentasDisponibles = cuentas.map((c) => c.id);

    /* Preparar las cuentas para el selector (excluyendo la cuenta actual) */
    const cuentasSelector = cuentas
        .filter((c) => c.id !== cuentaId)
        .map((c) => ({value: c.id, label: c.nombre}));

    const { register, handleSubmit, errors, isSubmitting } = useCustomForm({
        schema: transferenciaSchema(cuentaId, cuentasDisponibles),
        onSubmit: (data) => {
            agregarTransaccion(
                {
                    ...data,
                    cuenta_id: cuentaId,
                    tipo: 'gasto',
                    categoria_id: 6,
                },
                { onSuccess }
            );
        },
        defaultValues: {
            categoria_id: 6
        }
    });

    if (isLoading) {
        return <p className="text-center text-neutral-600">Cargando cuentas...</p>;
    }

    return (
        <>
            <h2 className="text-lg text-center font-semibold text-aguazul mb-2">
                Nueva transferencia
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <FormField
                    label="Monto"
                    name="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    prefix={<Euro size={16} className="text-neutral-600" />}
                    register={register}
                    error={errors.monto?.message}
                />

                <FormField
                    label="Cuenta destino"
                    name="cuenta_destino_id"
                    type="select"
                    register={register}
                    error={errors.cuenta_destino_id?.message}
                    options={cuentasSelector}
                />

                <FormField
                    label="Descripción"
                    name="descripcion"
                    type="text"
                    placeholder="Escribe una descripción"
                    register={register}
                    error={errors.descripcion?.message}
                />

                <FormField
                    label="Fecha"
                    name="fecha"
                    type="datetime-local"
                    register={register}
                    error={errors.fecha?.message}
                />

                <div className="flex justify-between">
                    <Boton tipo="texto" onClick={onBack}>
                        Atrás
                    </Boton>
                    <Boton
                        tipo="primario"
                        type="submit"
                        disabled={isSubmitting || isAddingTransaccion}
                    >
                        {isSubmitting || isAddingTransaccion ? 'Guardando…' : 'Guardar transferencia'}
                    </Boton>
                </div>
            </form>
        </>
    );
}