import {regex} from "./regex";

export const validarLoginForm = ({email, password}) => {
    const errores = {};

    if (!email) {
        errores.email = "El email es obligatorio";
    } else if (!regex.email.test(email)) {
        errores.email = "Formato de email inválido";
    }

    if (!password) {
        errores.password = "La contraseña es obligatoria";
    } else if (!regex.password.test(password)) {
        errores.password = "La contraseña debe tener al menos 6 caracteres, una letra y un número";
    }

    return errores;
};

export const validarRegistroForm = ({email, password, nombre, apellidos, avatar}) => {
    const errores = {};


    if (!nombre || !regex.nombre.test(nombre)) {
        errores.nombre = "El nombre debe tener entre 2 y 25 caracteres y no puede contener números";
    }

    if (!apellidos || !regex.apellidos.test(apellidos)) {
        errores.apellidos = "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números";
    }

    if (!email || !regex.email.test(email)) {
        errores.email = "El email no es válido";
    }

    if (!password || !regex.password.test(password)) {
        errores.password = "La contraseña debe tener al menos 6 caracteres, una letra y un número";
    }


    if (avatar instanceof File) {
        // Validar tamaño
        if (avatar.size > 5 * 1024 * 1024) {
            errores.avatar = "La imagen no debe superar los 5MB";
            return errores;
        }
        // Validar tipo
        if (!avatar.type.startsWith("image/")) {
            errores.avatar = "El archivo debe ser una imagen";
            return errores;
        }
        // Si pasa las validaciones, se procesará como una imagen válida
        if (typeof avatar === "string" && !avatar.startsWith("data:image/")) {
            errores.avatar = "Formato de imagen no válido";
        }
    }

    return errores;
};


export const validarRecuperarContrasena = ({email}) => {
    const errores = {};

    if (!email) {
        errores.email = "El email es obligatorio";
    } else if (!regex.email.test(email)) {
        errores.email = "Formato de email inválido";
    }

    return errores;
};

export const validarRestablecerContrasena = ({password, confirmPassword}) => {
    const errores = {};

    if (!password) {
        errores.password = "La contraseña es obligatoria";
    } else if (!regex.password.test(password)) {
        errores.password = "La contraseña debe tener al menos 6 caracteres, una letra y un número";
    }

    if (!confirmPassword) {
        errores.confirmPassword = "Debes confirmar la contraseña";
    } else if (password !== confirmPassword) {
        errores.confirmPassword = "Las contraseñas no coinciden";
    }

    return errores;
};

export const validarCuenta = (cuenta) => {
    const errores = {};

    if (!cuenta.nombre.trim()) {
        errores.nombre = "El nombre es obligatorio";
    } else if (cuenta.nombre.length < 3) {
        errores.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (cuenta.nombre.length > 28) {
        errores.nombre = "El nombre no puede exceder los 28 caracteres";
    }

    if (cuenta.balance > 9999999999 || cuenta.balance < -9999999999) {
        errores.balance = "El saldo no puede ser mayor a 10 dígitos";
    }

    return errores;
};
