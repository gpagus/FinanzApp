import * as Dialog from '@radix-ui/react-dialog';
import {useState} from 'react';
import {X, AlertCircle} from 'lucide-react';
import IngresoForm from './forms/IngresoForm';
import GastoForm from './forms/GastoForm';
import TransferenciaForm from "./forms/TransferenciaForm";
import Boton from './Boton';
import {useCuentas} from '../../hooks/useCuentas';

export default function NewOperationModal({open, onOpenChange, cuentaId}) {
    const [step, setStep] = useState('select'); // select | ingreso | gasto | transferencia
    const {cuentas} = useCuentas();
    
    // Verificar si hay otras cuentas disponibles para transferir
    const cuentasDisponiblesParaTransferir = cuentas.filter(cuenta => cuenta.id !== cuentaId);
    const puedeTransferir = cuentasDisponiblesParaTransferir.length > 0;

    const close = () => {
        setStep('select');
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"/>
                <Dialog.Content
                    className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg z-50">
                    <Dialog.Title/>
                    <Dialog.Description/>
                    <Dialog.Close asChild>
                        <Boton tipo="icono" className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600">
                            <X size={18}/>
                        </Boton>
                    </Dialog.Close>

                    {/* Paso 1: elegir operación */}
                    {step === 'select' && (
                        <div className="space-y-4">
                            <h2 className="text-lg text-center font-semibold text-aguazul mb-2">
                                ¿Qué operación deseas registrar?
                            </h2>
                            <Boton
                                tipo="secundario"
                                onClick={() => setStep('ingreso')}
                                className="w-full rounded-lg p-3"
                            >
                                Ingreso
                            </Boton>
                            <Boton
                                tipo="secundario"
                                onClick={() => setStep('gasto')}
                                className="w-full rounded-lg p-3"
                            >
                                Gasto
                            </Boton>
                            
                            {puedeTransferir ? (
                                <Boton
                                    tipo="secundario"
                                    onClick={() => setStep('transferencia')}
                                    className="w-full rounded-lg p-3"
                                >
                                    Transferencia
                                </Boton>
                            ) : (
                                <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                                    <div className="flex items-center text-neutral-500">
                                        <AlertCircle size={18} className="mr-2 text-neutral-400" />
                                        <span className="font-medium">Transferencia</span>
                                    </div>
                                    <p className="text-sm text-neutral-500 mt-2">
                                        Necesitas al menos otra cuenta para poder realizar transferencias.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Formularios */}
                    {step === 'ingreso' && (
                        <IngresoForm cuentaId={cuentaId} onSuccess={close} onBack={() => setStep('select')}/>
                    )}
                    {step === 'gasto' && (
                        <GastoForm cuentaId={cuentaId} onSuccess={close} onBack={() => setStep('select')}/>
                    )}
                    {step === 'transferencia' && puedeTransferir && (
                        <TransferenciaForm 
                            cuentaId={cuentaId} 
                            cuentasDisponibles={cuentasDisponiblesParaTransferir}
                            onSuccess={close} 
                            onBack={() => setStep('select')}
                        />
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
