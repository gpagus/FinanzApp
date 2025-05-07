// components/ui/NewOperationModal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import {useState} from 'react';
import {X} from 'lucide-react';
import IngresoForm from './forms/IngresoForm';
import Boton from './Boton';
// import GastoForm from './forms/GastoForm';

export default function NewOperationModal({open, onOpenChange, cuentaId}) {
    const [step, setStep] = useState('select'); // select | ingreso | gasto | transferencia

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
                        {[
                            {key: 'ingreso', label: 'Ingreso'},
                            {key: 'gasto', label: 'Gasto'},
                            {key: 'transferencia', label: 'Transferencia'},
                        ].map((op) => (
                            <Boton
                                tipo="secundario"
                                key={op.key}
                                onClick={() => setStep(op.key)}
                                className="w-full rounded-lg p-3 "
                            >
                                {op.label}
                            </Boton>
                        ))}
                    </div>
                )}

                {/* Formularios */}
                {step === 'ingreso' && (
                    <IngresoForm cuentaId={cuentaId} onSuccess={close} onBack={() => setStep('select')}/>
                )}
                {step === 'gasto' && (
                    <h1>Formulario de gasto</h1>
                    // <GastoForm cuentaId={cuentaId} onSuccess={close} onBack={() => setStep('select')} />
                )}
                {step === 'transferencia' && (
                    <h1>Formulario de transferencia</h1>
                    //  <TransferForm cuentaId={cuentaId} onSuccess={close} onBack={() => setStep('select')} />
                )}
            </Dialog.Content>
        </Dialog.Portal>
</Dialog.Root>
)
    ;
}
