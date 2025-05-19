import React, {useEffect} from 'react';
import {z} from 'zod';
import {X, EuroIcon} from 'lucide-react';
import Boton from "../Boton";
import FormField from "../FormField";
import useCustomForm from "../../../hooks/useCustomForm";
import {CATEGORIAS} from "../../../utils/constants";

// Esquema de validación con Zod (sin fecha_inicio)
const presupuestoSchema = z.object({
    categoria_id: z.string().min(1, 'La categoría es obligatoria'),
    limite: z.coerce
        .number()
        .positive('El límite debe ser un número positivo')
        .min(5, 'El límite debe ser al menos 5 euros')
        .max(999999999, 'El límite no puede exceder de los 9 dígitos'),
    fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria')
}).refine(data => {
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0); // Normalizar la hora actual
    return new Date(fechaHoy) < new Date(data.fecha_fin);
}, {
    message: "La fecha de fin debe ser posterior a la fecha actual",
    path: ["fecha_fin"]
});

const PresupuestoForm = ({mostrar, presupuestoSeleccionado, onSubmitPresupuesto, onClose}) => {
    // Valores por defecto
    const getDefaultValues = () => {
        const hoy = new Date();
        //Fecha fin por defecto: un mes después
        const fechaFin = new Date(hoy);
        fechaFin.setMonth(hoy.getMonth() + 1);

        if (presupuestoSeleccionado) {
            return {
                categoria_id: presupuestoSeleccionado.categoria_id?.toString() || '',
                limite: presupuestoSeleccionado.limite || '',
                fecha_fin: presupuestoSeleccionado.fecha_fin ? new Date(presupuestoSeleccionado.fecha_fin).toISOString().split('T')[0] : fechaFin.toISOString().split('T')[0]
            };
        }

        return {
            categoria_id: '',
            limite: '',
            fecha_fin: fechaFin.toISOString().split('T')[0]
        };
    };

    const {register, errors, handleSubmit, isSubmitting, reset} = useCustomForm({
        schema: presupuestoSchema,
        defaultValues: getDefaultValues(),
        onSubmit: (values) => {
            // Ya no se añade fecha_inicio, el servidor la establecerá automáticamente
            return onSubmitPresupuesto(values);
        },
    });

    // Actualizar el formulario cuando cambia el presupuesto seleccionado
    useEffect(() => {
        if (mostrar) {
            reset(getDefaultValues());
        }
    }, [presupuestoSeleccionado, mostrar, reset]);

    if (!mostrar) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm z-51 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-neutral-200 p-4">
                    <h2 className="text-xl font-bold text-aguazul">
                        {presupuestoSeleccionado ? 'Editar presupuesto' : 'Nuevo presupuesto'}
                    </h2>
                    <Boton
                        tipo="icono"
                        onClick={onClose}
                    >
                        <X size={20}/>
                    </Boton>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {presupuestoSeleccionado && (
                        <div className="mb-4 p-3 bg-neutral-100 text-neutral-600 rounded-lg border border-neutral/50">
                            <p className="text-sm">
                                La categoría no puede ser modificada una vez creado el
                                presupuesto.
                                Si necesitas cambiar de categoría, deberás crear un nuevo presupuesto.
                            </p>
                        </div>
                    )}

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
                        disabled={!!presupuestoSeleccionado}
                    />

                    <FormField
                        label="Límite de gasto"
                        name="limite"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        prefix={<EuroIcon size={16} className="text-neutral-600"/>}
                        register={register}
                        error={errors.limite?.message}
                    />

                    <FormField
                        label="Fecha de fin"
                        name="fecha_fin"
                        type="date"
                        register={register}
                        error={errors.fecha_fin?.message}
                        attributes={{min: new Date().toISOString().split('T')[0]}}
                    />

                    <div className="flex justify-end space-x-2">
                        <Boton
                            tipo="texto"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Boton>
                        <Boton
                            tipo="primario"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : presupuestoSeleccionado ? 'Actualizar' : 'Crear'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PresupuestoForm;