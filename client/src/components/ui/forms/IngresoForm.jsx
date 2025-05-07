import { z } from 'zod';
                import useCustomForm from "../../../hooks/useCustomForm";
                import useTransacciones from '../../../hooks/useTransacciones';
                import Boton from '../Boton';
                import FormField from "../FormField";

                /* --- esquema de validación --- */
                const ingresoSchema = z.object({
                    monto: z.number().positive('Debe ser mayor que 0'),
                    categoriaId: z.number(),
                    descripcion: z.string().max(255).optional(),
                    fecha: z.date(),
                });

                export default function IngresoForm({ cuentaId, onSuccess, onBack }) {
                    const { agregarTransaccion, isAddingTransaccion } = useTransacciones({ cuentaId });

                    const { register, handleSubmit, errors, isSubmitting } = useCustomForm(
                        ingresoSchema,
                        (data) => {
                            agregarTransaccion(
                                {
                                    ...data,
                                    cuenta_id: cuentaId,
                                    tipo: 'ingreso',
                                },
                                { onSuccess }
                            );
                        },
                        { monto: 0, categoriaId: 44, descripcion: '', fecha: new Date() }
                    );

                    return (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <FormField
                                label="Monto"
                                name="monto"
                                type="number"
                                step="0.01"
                                value={register('monto').value}
                                onChange={register('monto').onChange}
                                onBlur={register('monto').onBlur}
                                error={errors.monto?.message}
                            />

                            <FormField
                                label="Categoría"
                                name="categoriaId"
                                type="select"
                                value={register('categoriaId').value}
                                onChange={register('categoriaId').onChange}
                                onBlur={register('categoriaId').onBlur}
                                error={errors.categoriaId?.message}
                                options={[
                                    { value: 44, label: 'Salario' },
                                    { value: 45, label: 'Horas extra' },
                                ]}
                            />

                            <FormField
                                label="Descripción"
                                name="descripcion"
                                type="text"
                                value={register('descripcion').value}
                                onChange={register('descripcion').onChange}
                                onBlur={register('descripcion').onBlur}
                                error={errors.descripcion?.message}
                            />

                            <div className="flex justify-between">
                                <Boton tipo="texto" onClick={onBack} >
                                    Atrás
                                </Boton>
                                <Boton tipo="primario" disabled={isSubmitting || isAddingTransaccion}>
                                    {isSubmitting || isAddingTransaccion ? 'Guardando…' : 'Guardar ingreso'}
                                </Boton>
                            </div>
                        </form>
                    );
                }