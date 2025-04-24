import { useToast } from "../../context/ToastContext.jsx";
import Toast from "./Toast.jsx";

const ToastContainer = () => {
    const { toasts } = useToast();

    // Solo renderizar el contenedor si hay toasts
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 w-72 max-w-full z-50">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                />
            ))}
        </div>
    );
};
export default ToastContainer;