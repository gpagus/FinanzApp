import {z} from 'zod';
import {CATEGORIAS} from "../../../utils/constants";
import useCustomForm from "../../../hooks/useCustomForm";
import useTransacciones from '../../../hooks/useTransacciones';
import Boton from '../Boton';
import FormField from "../FormField";

/* --- esquema de validación --- */
const ingresoSchema = z.object({
    monto: z.coerce.number().positive('Debe ser mayor que 0'),
    categoria_id: z.coerce.number().min(1, 'Categoría no válida').max(9, 'Categoría no válida'),
    descripcion: z.string().min(1, 'Introduzca una descripción').max(50, 'Máximo 50 caracteres'),
    fecha: z.coerce.date({
        errorMap: () => ({message: 'Introduzca una fecha'})
    }).refine((date) => date <= new Date(), {
        message: 'La fecha no puede ser futura',
    })
});

export default function IngresoForm({cuentaId, onSuccess, onBack}) {
    const {agregarTransaccion, isAddingTransaccion} = useTransacciones({cuentaId});

    const {register, handleSubmit, errors, isSubmitting} = useCustomForm({
        schema: ingresoSchema,
        onSubmit: (data) => {
            agregarTransaccion(
                {
                    ...data,
                    cuenta_id: cuentaId,
                    tipo: 'ingreso',
                },
                {onSuccess}
            );
        },
    });


    return (
        <>
            <h2 className="text-lg text-center font-semibold text-aguazul mb-2">
                Nuevo ingreso
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <FormField
                    label="Monto"
                    name="monto"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    register={register}
                    error={errors.monto?.message}
                />

                <FormField
                    label="Categoría"
                    name="categoria_id"
                    type="select"
                    register={register}
                    error={errors.categoria_id?.message}
                    options={CATEGORIAS.filter((cat) => cat.tipo === 'ingreso').map((cat) => ({
                        value: cat.value,
                        label: cat.icono + ' ' + cat.label,
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
                    <Boton tipo="primario" type="submit" disabled={isSubmitting || isAddingTransaccion}>
                        {isSubmitting || isAddingTransaccion ? 'Guardando…' : 'Guardar ingreso'}
                    </Boton>
                </div>
            </form>
        </>
    );
}
