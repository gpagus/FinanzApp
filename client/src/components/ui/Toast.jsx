import Boton from "./Boton.jsx";
import {useToast} from "../../context/ToastContext.jsx";

const Toast = ({id, message, type}) => {

    const {removeToast} = useToast();

    const toastStyles = {
        info: 'bg-info-100 border-info text-info',
        success: 'bg-success-100 border-success text-success',
        warning: 'bg-warning-100 border-warning text-warning',
        error: 'bg-error-100 border-error text-error',
    };

    return (
        <div className={`rounded px-4 py-3 mb-2 flex justify-between items-center border-l-4 ${toastStyles[type]}`}>
            <p>{message}</p>
            <Boton
                tipo="texto"
                className="text-neutral-900 hover:text-neutral-600"
                onClick={() => removeToast(id)}

            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </Boton>

        </div>
    );
};

export default Toast;