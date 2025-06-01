import * as Dialog from '@radix-ui/react-dialog';
import {useState} from 'react';
import {X, AlertCircle} from 'lucide-react';
import {useNavigate} from 'react-router-dom'; 
import IngresoForm from './forms/IngresoForm';
import GastoForm from './forms/GastoForm';
import TransferenciaForm from "./forms/TransferenciaForm";
import Boton from './Boton';
import {useCuentas} from '../../hooks/useCuentas';

export default function NewOperationModal({open, onOpenChange, cuentaId = null}) {
    const [step, setStep] = useState(cuentaId ? 'select' : 'selectAccount');
    const [selectedAccountId, setSelectedAccountId] = useState(cuentaId);
    const {cuentas} = useCuentas();
    const navigate = useNavigate(); 
    
    // Verificar si hay otras cuentas disponibles para transferir
    const cuentasDisponiblesParaTransferir = cuentas.filter(cuenta => cuenta.id !== selectedAccountId);
    const puedeTransferir = cuentasDisponiblesParaTransferir.length > 0;

    const close = () => {
        setStep(cuentaId ? 'select' : 'selectAccount');
        setSelectedAccountId(cuentaId);
        onOpenChange(false);
    };

    const handleSelectAccount = (accountId) => {
        setSelectedAccountId(accountId);
        setStep('select');
    };

    const handleGoToCuentas = () => {
        close();
        navigate('/cuentas');
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

                    {/* Paso 0: Seleccionar cuenta (solo si no viene cuentaId) */}
                    {step === 'selectAccount' && (
                        <div className="space-y-4">
                            <h2 className="text-lg text-center font-semibold text-aguazul mb-4">
                                ¿En qué cuenta quieres registrar la operación?
                            </h2>
                            {cuentas.length === 0 ? (
                                <div className="text-center text-neutral-500 py-4">
                                    <p className="mb-3">No tienes cuentas creadas</p>
                                    <p className="text-sm mb-4">
                                        Necesitas crear al menos una cuenta para poder registrar operaciones
                                    </p>
                                    <Boton 
                                        tipo="primario" 
                                        onClick={handleGoToCuentas}
                                        className="w-full"
                                    >
                                        Mis cuentas
                                    </Boton>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {cuentas.map((cuenta) => (
                                        <Boton
                                            key={cuenta.id}
                                            tipo="secundario"
                                            onClick={() => handleSelectAccount(cuenta.id)}
                                            className="w-full p-3 text-left flex justify-between items-center"
                                        >
                                            <span className="font-medium">{cuenta.nombre}</span>
                                            <span className={`text-sm ${cuenta.balance >= 0 ? 'text-success' : 'text-error'}`}>
                                                {cuenta.balance >= 0 ? '+' : ''}{cuenta.balance.toFixed(2)}€
                                            </span>
                                        </Boton>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 1: elegir operación */}
                    {step === 'select' && (
                        <div className="space-y-4">
                            <h2 className="text-lg text-center font-semibold text-aguazul mb-2">
                                ¿Qué operación deseas registrar?
                            </h2>
                            
                            {/* Mostrar cuenta seleccionada */}
                            {!cuentaId && (
                                <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-600">Cuenta seleccionada:</span>
                                        <Boton 
                                            tipo="texto" 
                                            onClick={() => setStep('selectAccount')}
                                            className="text-xs"
                                        >
                                            Cambiar
                                        </Boton>
                                    </div>
                                    <span className="font-medium">
                                        {cuentas.find(c => c.id === selectedAccountId)?.nombre}
                                    </span>
                                </div>
                            )}

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
                        <IngresoForm 
                            cuentaId={selectedAccountId} 
                            onSuccess={close} 
                            onBack={() => setStep('select')}
                        />
                    )}
                    {step === 'gasto' && (
                        <GastoForm 
                            cuentaId={selectedAccountId} 
                            onSuccess={close} 
                            onBack={() => setStep('select')}
                        />
                    )}
                    {step === 'transferencia' && puedeTransferir && (
                        <TransferenciaForm 
                            cuentaId={selectedAccountId} 
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
