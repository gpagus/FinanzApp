import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import FormField from "../components/ui/FormField";
import Boton from "../components/ui/Boton";
import useForm from "../components/useForm";
import {validarRegistroForm} from "../utils/validaciones";
import {UserRoundPlus} from "lucide-react";

const Register = () => {
    const {register, error} = useAuth();
    const navigate = useNavigate();
    const [previewUrl, setPreviewUrl] = useState(null);

    // Configuración inicial para useForm
    const {values, errors, handleChange, handleBlur, handleSubmit} = useForm(
        {
            nombre: "",
            apellidos: "",
            email: "",
            password: "",
            avatar: "",
        },
        validarRegistroForm,
        async () => {
            await register(values);
            navigate("/dashboard");
        }
    );

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            handleChange({
                target: {
                    name: 'avatar',
                    value: file
                }
            });
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem-2.5rem)] lg:flex-row bg-neutral-100">
            {/* Sección del formulario */}
            <div className="lg:w-1/2 flex items-center justify-center bg-neutral-100 px-6 py-8">
                <div className="w-full max-w-md">
                    <div className="mb-5 text-center">
                        <h1 className="text-3xl font-bold text-aguazul">Crear cuenta</h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white shadow-lg rounded-2xl px-8 py-10 w-full space-y-5"
                    >
                        <div className="space-y-4">
                            <FormField
                                label="Nombre"
                                name="nombre"
                                value={values.nombre}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors?.nombre}
                            />

                            <FormField
                                label="Apellidos"
                                name="apellidos"
                                value={values.apellidos}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors?.apellidos}
                            />

                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors?.email}
                            />

                            <FormField
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors?.password}
                            />

                            <FormField
                                type="file"
                                name="avatar"
                                label="Avatar (opcional)"
                                accept="image/*"
                                placeholder="Selecciona una imagen..."
                                onChange={handleAvatarChange}
                                onBlur={handleBlur}
                                error={errors?.avatar}
                            />

                            {previewUrl && (
                                <div className="mt-2 flex justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="Vista previa del avatar"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-aguazul"
                                    />
                                </div>
                            )}
                        </div>

                        <Boton type="submit" fullWidth>
                            Registrarse
                        </Boton>

                        {error && (
                            <div className="mt-4 text-sm text-error text-center">{error}</div>
                        )}

                        <div className="text-center mt-2">
                            <Boton tipo="texto" to="/" className="text-sm text-neutral-600">
                                Volver a la página de inicio
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sección de diseño/ilustración */}
            <div className="hidden lg:block lg:w-1/2 bg-aguazul">
                <div className="h-full flex flex-col items-center justify-center px-12 text-white">
                    <div className="max-w-lg text-center">
                        <div className="mb-8">
                            <div
                                className="w-24 h-24 mx-auto bg-dollar-500 bg-opacity-30 rounded-full flex items-center justify-center">
                                <UserRoundPlus className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">
                            Toma el control de tus finanzas
                        </h2>
                        <p className="text-lg opacity-90 mb-10">
                            Organiza tus gastos, establece objetivos de ahorro y visualiza tu
                            progreso financiero con nuestra herramienta intuitiva.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;