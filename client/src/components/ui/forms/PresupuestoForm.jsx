import React from 'react';
import { z } from 'zod';
import { X } from 'lucide-react';
import Boton from "../Boton";
import FormField from "../FormField";
import useCustomForm from "../../../hooks/useCustomForm";
import { CATEGORIAS } from "../../../utils/constants";

// Esquema de validación con Zod
const presupuestoSchema = z.object({
    categoria_id: z.string().min(1, 'La categoría es obligatoria'),
    limite: z.coerce
        .number()
        .positive('El límite debe ser un número positivo')
        .min(1, 'El límite debe ser mayor a 0'),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria')
}).refine(data => {
    return new Date(data.fecha_inicio) < new Date(data.fecha_fin);
}, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["fecha_fin"]
});

const PresupuestoForm = ({ mostrar, presupuestoSeleccionado, onSubmitPresupuesto, onClose }) => {
    // Valores por defecto
    const getDefaultValues = () => {
        if (presupuestoSeleccionado) {
            return {
                categoria_id: presupuestoSeleccionado.categoria_id || '',
                limite: presupuestoSeleccionado.limite || '',
                fecha_inicio: presupuestoSeleccionado.fecha_inicio ? new Date(presupuestoSeleccionado.fecha_inicio).toISOString().split('T')[0] : '',
                fecha_fin: presupuestoSeleccionado.fecha_fin ? new Date(presupuestoSeleccionado.fecha_fin).toISOString().split('T')[0] : ''
            };
        }

        const hoy = new Date();
        const fechaInicio = hoy.toISOString().split('T')[0];

        //Fecha fin por defecto: un mes después
        const fechaFin = new Date(hoy);
        fechaFin.setMonth(hoy.getMonth() + 1);

        return {
            categoria_id: '',
            limite: '',
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin.toISOString().split('T')[0]
        };
    };

    const { register, errors, handleSubmit, isSubmitting } = useCustomForm({
        schema: presupuestoSchema,
        defaultValues: getDefaultValues(),
        onSubmit: onSubmitPresupuesto,
    });

    // Manejar cambio de fecha inicio manualmente
    const handleFechaInicioChange = (e) => {
        if (e.target.value) {
            const fechaInicioInput = document.querySelector('input[name="fecha_fin"]');
            if (fechaInicioInput) {
                fechaInicioInput.min = e.target.value;
            }
        }
    };

    if (!mostrar) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-bold text-neutral-900">
                        {presupuestoSeleccionado ? 'Editar presupuesto' : 'Nuevo presupuesto'}
                    </h2>
                    <button
                        className="text-neutral-500 hover:text-neutral-700"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <FormField
                        label="Categoría"
                        name="categoria_id"
                        type="select"
                        register={register}
                        error={errors.categoria_id?.message}
                        options={[
                            { value: "", label: "Selecciona una categoría" },
                            ...CATEGORIAS.map(categoria => ({
                                value: categoria.id,
                                label: categoria.nombre
                            }))
                        ]}
                    />

                    <FormField
                        label="Límite de gasto"
                        name="limite"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        register={register}
                        error={errors.limite?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Fecha de inicio"
                            name="fecha_inicio"
                            type="date"
                            register={register}
                            error={errors.fecha_inicio?.message}
                            onChange={handleFechaInicioChange}
                        />

                        <FormField
                            label="Fecha de fin"
                            name="fecha_fin"
                            type="date"
                            register={register}
                            error={errors.fecha_fin?.message}
                            attributes={{ min: getDefaultValues().fecha_inicio }}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Boton
                            tipo="secundario"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Boton>
                        <Boton
                            tipo="primario"
                            submit
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