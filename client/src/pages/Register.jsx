import {useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {useAuth} from "../context/AuthContext";
import FormField from "../components/ui/FormField";
import Boton from "../components/ui/Boton";
import {UserRoundPlus} from "lucide-react";
import useCustomForm from "../hooks/useCustomForm";
import registerSchema from "../schemas/registerSchema";

const Register = () => {
    const {register: registerUser, error} = useAuth();
    const navigate = useNavigate();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarError, setAvatarError] = useState(null);

    const {register, handleSubmit, errors} = useCustomForm({
        schema: registerSchema,
        onSubmit: async (data) => {
            // Añadimos el avatar a los datos
            const formData = {
                ...data,
                avatar: avatarFile
            };
            await registerUser(formData);
            navigate("/dashboard");
        },
        defaultValues: {
            nombre: "",
            apellidos: "",
            email: "",
            password: "",
        },
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setPreviewUrl(null);
            setAvatarFile(null);
            setAvatarError(null);
            return;
        }

        if (file.size > 1024 * 1024) {
            setAvatarError("El archivo no puede ser mayor de 1MB");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setAvatarError("El archivo debe ser una imagen");
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setAvatarFile(file); // Almacena el archivo en estado local
        setAvatarError(null);
    };
    // Limpiar URLs de objeto al desmontar
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

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
                                register={register}
                                error={errors?.nombre?.message}
                            />

                            <FormField
                                label="Apellidos"
                                name="apellidos"
                                register={register}
                                error={errors?.apellidos?.message}
                            />

                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                register={register}
                                error={errors?.email?.message}
                            />

                            <FormField
                                label="Contraseña"
                                name="password"
                                type="password"
                                register={register}
                                error={errors?.password?.message}
                            />

                            <div className="space-y-1">
                                <label htmlFor="avatar" className="block text-sm font-medium text-neutral-700">
                                    Avatar (opcional)
                                </label>
                                <input
                                    type="file"
                                    id="avatar"
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aguazul"
                                    onChange={handleAvatarChange}
                                />
                                {avatarError && (
                                    <p className="text-xs text-error">{avatarError}</p>
                                )}
                            </div>

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
                                <UserRoundPlus className="w-12 h-12 text-white"/>
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