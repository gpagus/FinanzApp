import {z} from "zod";
    import {CATEGORIAS} from "../../../utils/constants";
    import useTransacciones from "../../../hooks/useTransacciones";
    import useCustomForm from "../../../hooks/useCustomForm";
    import FormField from "../../ui/FormField";
    import Boton from "../../ui/Boton";
    import {X} from "lucide-react";

    function EditarTransaccionForm({ transaccion, onSuccess, onClose, isVisible }) {
        const cuentaIdFinal = transaccion?.cuenta_id;
        const { actualizarTransaccion, isUpdatingTransaccion } = useTransacciones({
            cuentaId: cuentaIdFinal
        });

        const schema = z.object({
            categoria_id: z.coerce.number().min(1, 'Categoría no válida'),
            descripcion: z.string().min(1, 'Introduzca una descripción').max(50, 'Máximo 50 caracteres')
        });

        const { register, handleSubmit, errors, isSubmitting } = useCustomForm({
            schema,
            defaultValues: {
                categoria_id: transaccion?.categoria_id,
                descripcion: transaccion?.descripcion
            },
            // En EditarTransaccionForm.jsx
            onSubmit: (data) => {
                actualizarTransaccion(
                    {
                        id: transaccion.id,
                        datos: {
                            ...data,
                            monto: transaccion.monto // Incluir el monto original
                        },
                        montoAnterior: transaccion.monto
                    },
                    { onSuccess }
                );
            }
        });

        if (!isVisible || !transaccion) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                    <div className="flex justify-between items-center p-4 border-b border-neutral-200">
                        <h3 className="text-lg font-semibold text-aguazul">Editar transacción</h3>
                        <Boton tipo="icono" onClick={onClose} aria-label="Cerrar">
                            <X size={20} />
                        </Boton>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormField
                                label="Categoría"
                                name="categoria_id"
                                type="select"
                                register={register}
                                error={errors.categoria_id?.message}
                                options={CATEGORIAS.filter(cat => cat.tipo === transaccion.tipo).map(cat => ({
                                    value: cat.value,
                                    label: cat.icono + ' ' + cat.label
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

                            <div className="flex justify-between mt-6">
                                <Boton tipo="texto" onClick={onClose}>Cancelar</Boton>
                                <Boton
                                    tipo="primario"
                                    type="submit"
                                    disabled={isSubmitting || isUpdatingTransaccion}
                                >
                                    {isSubmitting || isUpdatingTransaccion ? 'Guardando…' : 'Guardar cambios'}
                                </Boton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    export default EditarTransaccionForm;