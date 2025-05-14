import {CreditCard, PiggyBank, Wallet, TrendingUp} from 'lucide-react';

export const TIPOS_CUENTA = [
    {
        id: 'corriente',
        nombre: 'Cuenta Corriente',
        Icono: CreditCard,
        value: 'corriente',
        label: 'Cuenta Corriente',
    },
    {
        id: 'ahorro',
        nombre: 'Cuenta de Ahorro',
        Icono: PiggyBank,
        value: 'ahorro',
        label: 'Cuenta de Ahorro',
    },
    {
        id: 'credito',
        nombre: 'Tarjeta de Crédito',
        Icono: CreditCard,
        value: 'credito',
        label: 'Tarjeta de Crédito',
    },
    {
        id: 'inversion',
        nombre: 'Inversión',
        Icono: TrendingUp,
        value: 'inversion',
        label: 'Inversión',
    },
];

export const CATEGORIAS = [
    /* --- INGRESOS --- */
    { value: 1, label: 'Nómina o pensión', tipo: 'ingreso', icono: '💵' },
    { value: 2, label: 'Subvenciones', tipo: 'ingreso', icono: '🏦' },
    { value: 3, label: 'Otros ingresos', tipo: 'ingreso', icono: '💰' },
    { value: 4, label: 'Ahorro e inversión', tipo: 'ingreso', icono: '📈' },
    { value: 7, label: 'Efectivo', tipo: 'ingreso', icono: '💵' },
    { value: 8, label: 'Ingresos profesionales', tipo: 'ingreso', icono: '‍💼' },
    { value: 9, label: 'Ingreso alquiler', tipo: 'ingreso', icono: '🏡' },

    /* -- TRANSFERENCIAS --- */
    { value: 5, label: 'Transferencia recibida', tipo: 'transferencia', icono: '📥' },
    { value: 6, label: 'Transferencia enviada', tipo: 'transferencia', icono: '📤' },

    /* --- GASTOS --- */
    { value: 10, label: 'Alimentación', tipo: 'gasto', icono: '🍽️' },
    { value: 11, label: 'Transporte', tipo: 'gasto', icono: '🚗' },
    { value: 12, label: 'Ocio y Entretenimiento', tipo: 'gasto', icono: '🎮' },
    { value: 13, label: 'Salud y Bienestar', tipo: 'gasto', icono: '💅' },
    { value: 14, label: 'Educación', tipo: 'gasto', icono: '📚' },
    { value: 15, label: 'Vivienda', tipo: 'gasto', icono: '🏠' },
    { value: 16, label: 'Ropa y Calzado', tipo: 'gasto', icono: '👗' },
    { value: 17, label: 'Tecnología', tipo: 'gasto', icono: '💻' },
    { value: 18, label: 'Viajes', tipo: 'gasto', icono: '✈️' },
    { value: 19, label: 'Hogar y Suministros', tipo: 'gasto', icono: '🏡' },
    { value: 20, label: 'Mascotas', tipo: 'gasto', icono: '🐾' },
    { value: 21, label: 'Impuestos y Tasas', tipo: 'gasto', icono: '💸' },
    { value: 22, label: 'Donaciones', tipo: 'gasto', icono: '🤝' },
    { value: 23, label: 'Regalos', tipo: 'gasto', icono: '🎁' },
    { value: 24, label: 'Otros Gastos', tipo: 'gasto', icono: '💸' }
];