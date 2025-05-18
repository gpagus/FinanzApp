import React, {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import {Save, UserRound, KeyRound, Upload, Trash2, Loader} from 'lucide-react';
import {z} from 'zod';
import useCustomForm from '../../hooks/useCustomForm';
import Boton from '../../components/ui/Boton';
import FormField from '../../components/ui/FormField';

const SettingsPage = () => {
    const {user, updateUserProfile, cambiarContrasena} = useAuth();
    const [activeTab, setActiveTab] = useState('perfil');
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarError, setAvatarError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState({perfil: false, password: false});

    // Esquema para validación del perfil basado en el registerSchema
    const perfilSchema = z.object({
        nombre: z
            .string()
            .min(2, "El nombre debe tener entre 2 y 25 caracteres y no puede contener números")
            .max(25, "El nombre debe tener entre 2 y 25 caracteres y no puede contener números")
            .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, "El nombre debe tener entre 2 y 25 caracteres y no puede contener números"),

        apellidos: z
            .string()
            .min(2, "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números")
            .max(50, "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números")
            .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números"),
    });

    // Esquema para validación de contraseña
    const passwordSchema = z.object({
        currentPassword: z.string().min(6, 'La contraseña actual es requerida'),
        newPassword: z
            .string()
            .min(6, "La contraseña debe tener al menos 6 caracteres, una letra y un número")
            .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "La contraseña debe tener al menos 6 caracteres, una letra y un número"),
        confirmPassword: z.string().min(6, 'Confirma la nueva contraseña'),
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"]
    });

    // Formulario para perfil
    const {
        register: registerPerfil,
        handleSubmit: handleSubmitPerfil,
        errors: errorsPerfil,
        isSubmitting: isSubmittingPerfil
    } = useCustomForm({
        schema: perfilSchema,
        onSubmit: async (data) => {
            try {
                await updateUserProfile({
                    ...data,
                    avatar: avatarFile ? await uploadAvatar(avatarFile) : user.avatar
                });
                setUpdateSuccess({...updateSuccess, perfil: true});
                setTimeout(() => setUpdateSuccess({...updateSuccess, perfil: false}), 3000);
            } catch (error) {
                console.error('Error al actualizar perfil:', error);
            }
        },
        defaultValues: {
            nombre: user?.nombre || '',
            apellidos: user?.apellidos || '',
        }
    });

    // Formulario para contraseña
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        errors: errorsPassword,
        isSubmitting: isSubmittingPassword,
        reset: resetPassword
    } = useCustomForm({
        schema: passwordSchema,
        onSubmit: async (data) => {
            try {
                await cambiarContrasena(data.currentPassword, data.newPassword);
                resetPassword();
                setUpdateSuccess({...updateSuccess, password: true});
                setTimeout(() => setUpdateSuccess({...updateSuccess, password: false}), 3000);
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
            }
        }
    });

    // Cargar avatar actual
    useEffect(() => {
        if (user?.avatar) {
            const baseUrl = import.meta.env.VITE_SUPABASE_AVATAR_BASE_URL;
            const avatarUrl = `${baseUrl}${user.avatar}`;
            if (!avatarUrl.includes("null")) {
                setAvatarPreview(avatarUrl);
            }
        }
    }, [user]);

    // Manejar subida de avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
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

        setAvatarFile(file);
        setAvatarError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Función para subir avatar
    const uploadAvatar = async (file) => {
        setIsUploading(true);
        try {
            // Esta función simula la subida del avatar
            // En una implementación real, aquí subirías el archivo al servidor
            await new Promise(resolve => setTimeout(resolve, 1000));
            return 'nuevo-avatar-path.jpg';
        } finally {
            setIsUploading(false);
        }
    };

    // Eliminar avatar
    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarFile(null);
        setAvatarError(null);
    };

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            <h1 className="text-2xl font-bold text-aguazul mb-6">Configuración</h1>

            {/* Pestañas de navegación */}
            <div className="border-b border-neutral-200 mb-6">
                <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab('perfil')}
                            className={`inline-flex items-center py-3 px-4 font-medium cursor-pointer ${
                                activeTab === 'perfil'
                                    ? 'text-aguazul border-b-2 border-aguazul'
                                    : 'text-neutral-500 hover:text-aguazul hover:border-neutral-300'
                            }`}
                        >
                            <UserRound size={18} className="mr-2"/>
                            Perfil
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab('seguridad')}
                            className={`inline-flex items-center py-3 px-4 font-medium cursor-pointer ${
                                activeTab === 'seguridad'
                                    ? 'text-aguazul border-b-2 border-aguazul'
                                    : 'text-neutral-500 hover:text-aguazul hover:border-neutral-300'
                            }`}
                        >
                            <KeyRound size={18} className="mr-2"/>
                            Seguridad
                        </button>
                    </li>
                </ul>
            </div>

            {/* Contenido de las pestañas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Pestaña de Perfil */}
                {activeTab === 'perfil' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Datos personales</h2>

                        {/* Avatar */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Foto de perfil
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    {isUploading && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                            <Loader size={24} className="text-white animate-spin"/>
                                        </div>
                                    )}
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="h-24 w-24 rounded-full border-2 border-neutral-300 object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="h-24 w-24 rounded-full border-2 border-neutral-300 flex items-center justify-center bg-neutral-100">
                                            <UserRound size={40} className="text-neutral-600"/>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="avatar-upload" className="cursor-pointer">
                                        <div
                                            className="flex items-center space-x-2 text-sm text-aguazul hover:underline">
                                            <Upload size={16}/>
                                            <span>Subir imagen</span>
                                        </div>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                            disabled={isUploading}
                                        />
                                    </label>
                                    {avatarPreview && (
                                        <button
                                            onClick={handleRemoveAvatar}
                                            className="flex items-center space-x-2 text-sm text-error cursor-pointer hover:underline"
                                            disabled={isUploading}
                                        >
                                            <Trash2 size={16}/>
                                            <span>Eliminar foto</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {avatarError && (
                                <p className="mt-1 text-xs text-error">{avatarError}</p>
                            )}
                        </div>

                        {/* Formulario de perfil */}
                        <form onSubmit={handleSubmitPerfil} className="space-y-4">
                            <FormField
                                label="Nombre"
                                name="nombre"
                                register={registerPerfil}
                                error={errorsPerfil.nombre?.message}
                                placeholder="Introduce tu nombre"
                                disabled={isSubmittingPerfil}
                            />

                            <FormField
                                label="Apellidos"
                                name="apellidos"
                                register={registerPerfil}
                                error={errorsPerfil.apellidos?.message}
                                placeholder="Introduce tus apellidos"
                                disabled={isSubmittingPerfil}
                            />

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-neutral-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-xs text-neutral-500">
                                    No es posible cambiar el email asociado a tu cuenta.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Boton
                                    className="flex items-center"
                                    tipo="primario"
                                    type="submit"
                                    disabled={isSubmittingPerfil}
                                >
                                    {isSubmittingPerfil ? (
                                        <>
                                            <Loader size={16} className="animate-spin mr-2"/>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="mr-2"/>
                                            Guardar cambios
                                        </>
                                    )}
                                </Boton>
                            </div>

                            {updateSuccess.perfil && (
                                <div className="mt-2 p-2 bg-success/10 text-success rounded text-sm">
                                    Perfil actualizado correctamente
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Pestaña de Seguridad */}
                {activeTab === 'seguridad' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Cambiar contraseña</h2>

                        <form onSubmit={handleSubmitPassword} className="space-y-4">
                            <FormField
                                label="Contraseña actual"
                                name="currentPassword"
                                type="password"
                                register={registerPassword}
                                error={errorsPassword.currentPassword?.message}
                                placeholder="Introduce tu contraseña actual"
                                disabled={isSubmittingPassword}
                            />

                            <FormField
                                label="Nueva contraseña"
                                name="newPassword"
                                type="password"
                                register={registerPassword}
                                error={errorsPassword.newPassword?.message}
                                placeholder="Introduce tu nueva contraseña"
                                disabled={isSubmittingPassword}
                            />

                            <FormField
                                label="Confirmar nueva contraseña"
                                name="confirmPassword"
                                type="password"
                                register={registerPassword}
                                error={errorsPassword.confirmPassword?.message}
                                placeholder="Confirma tu nueva contraseña"
                                disabled={isSubmittingPassword}
                            />

                            <div className="flex justify-end">
                                <Boton
                                    className="flex items-center"
                                    tipo="primario"
                                    type="submit"
                                    disabled={isSubmittingPassword}
                                >
                                    {isSubmittingPassword ? (
                                        <>
                                            <Loader size={16} className="animate-spin mr-2"/>
                                            Cambiando...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound size={16} className="mr-2"/>
                                            Cambiar contraseña
                                        </>
                                    )}
                                </Boton>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;