// components/ui/forms/GastoForm.jsx
import { z } from 'zod';
import { CATEGORIAS } from '../../../utils/constants';
import useCustomForm from '../../../hooks/useCustomForm';
import useTransacciones from '../../../hooks/useTransacciones';
import {obtenerFechaHoraActual} from "../../../utils/formatters";
import Boton from '../Boton';
import FormField from '../FormField';
import {Euro} from "lucide-react";

/* --- esquema de validación para GASTOS --- */
const gastoSchema = z.object({
    monto: z.coerce.number()
        .positive('Debe ser mayor que 0')
        .max(999999999, 'El monto no puede exceder de los 9 dígitos'),
    categoria_id: z.coerce
        .number()
        .min(10, 'Categoría no válida')
        .max(42, 'Categoría no válida'),
    descripcion: z
        .string()
        .min(1, 'Introduzca una descripción')
        .max(50, 'Máximo 50 caracteres'),
    fecha: z
        .coerce
        .date({
            errorMap: () => ({ message: 'Introduzca una fecha' }),
        })
        .refine((date) => date <= new Date(), {
            message: 'La fecha no puede ser futura',
        }),
});

export default function GastoForm({ cuentaId, onSuccess, onBack }) {
    const { agregarTransaccion, isAddingTransaccion } = useTransacciones({ cuentaId });

    const { register, handleSubmit, errors, isSubmitting } = useCustomForm({
        schema: gastoSchema,
        defaultValues: {
            fecha: obtenerFechaHoraActual()
        },
        onSubmit: (data) => {
            agregarTransaccion(
                {
                    ...data,
                    cuenta_id: cuentaId,
                    tipo: 'gasto',
                },
                { onSuccess }
            );
        },
    });

    return (
        <>
            <h2 className="text-lg text-center font-semibold text-aguazul mb-2">
                Nuevo gasto
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <FormField
                    label="Monto"
                    name="monto"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    prefix={<Euro size={16} className="text-neutral-600" />}
                    max="0"
                    register={register}
                    error={errors.monto?.message}
                />

                <FormField
                    label="Categoría"
                    name="categoria_id"
                    type="select"
                    register={register}
                    error={errors.categoria_id?.message}
                    options={CATEGORIAS.filter((cat) => cat.tipo === 'gasto').map((cat) => ({
                        value: cat.value,
                        label: `${cat.icono} ${cat.label}`,
                    }))}
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
                        {isSubmitting || isAddingTransaccion ? 'Guardando…' : 'Guardar gasto'}
                    </Boton>
                </div>
            </form>
        </>
    );
}