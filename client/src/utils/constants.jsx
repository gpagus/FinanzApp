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
    { value: 4, label: 'Ahorro e inversión', tipo: 'ingreso', icono: '📈' },
    { value: 7, label: 'Efectivo', tipo: 'ingreso', icono: '💵' },
    { value: 8, label: 'Ingresos profesionales', tipo: 'ingreso', icono: '‍💼' },
    { value: 9, label: 'Ingreso alquiler', tipo: 'ingreso', icono: '🏡' },
    { value: 1, label: 'Nómina o pensión', tipo: 'ingreso', icono: '💵' },
    { value: 3, label: 'Otros ingresos', tipo: 'ingreso', icono: '💰' },
    { value: 2, label: 'Subvenciones', tipo: 'ingreso', icono: '🏦' },
    { value: 5, label: 'Traspasos', tipo: 'ingreso', icono: '🔄' },
    { value: 6, label: 'Transferencias', tipo: 'ingreso', icono: '💸' },

    /* --- GASTOS --- */
    { value: 17, label: 'Agua', tipo: 'gasto', icono: '💧' },
    { value: 14, label: 'Apunte interno', tipo: 'gasto', icono: '📝' },
    { value: 22, label: 'Compras', tipo: 'gasto', icono: '🛍️' },
    { value: 35, label: 'Comercio electrónico', tipo: 'gasto', icono: '🛍️' },
    { value: 32, label: 'Donaciones y asociaciones', tipo: 'gasto', icono: '🤝' },
    { value: 26, label: 'Educación', tipo: 'gasto', icono: '📚' },
    { value: 15, label: 'Electricidad', tipo: 'gasto', icono: '⚡' },
    { value: 25, label: 'Electrónica', tipo: 'gasto', icono: '💻' },
    { value: 38, label: 'Gastos profesionales', tipo: 'gasto', icono: '‍💼' },
    { value: 41, label: 'Gastos financieros', tipo: 'gasto', icono: '💱' },
    { value: 34, label: 'Grandes superficies', tipo: 'gasto', icono: '🏬' },
    { value: 13, label: 'Hipoteca', tipo: 'gasto', icono: '🏠' },
    { value: 27, label: 'Hogar', tipo: 'gasto', icono: '🏡' },
    { value: 40, label: 'Impuestos y tasas', tipo: 'gasto', icono: '💸' },
    { value: 29, label: 'Movilidad y transporte', tipo: 'gasto', icono: '🚗' },
    { value: 20, label: 'Moda', tipo: 'gasto', icono: '👗' },
    { value: 30, label: 'Ocio', tipo: 'gasto', icono: '🎮' },
    { value: 24, label: 'Otros gastos', tipo: 'gasto', icono: '💸' },
    { value: 23, label: 'Otros recibos', tipo: 'gasto', icono: '🧾' },
    { value: 28, label: 'Pago alquiler', tipo: 'gasto', icono: '🏘️' },
    { value: 11, label: 'Préstamos', tipo: 'gasto', icono: '💳' },
    { value: 37, label: 'Retirada de efectivo', tipo: 'gasto', icono: '🏧' },
    { value: 21, label: 'Salud y belleza', tipo: 'gasto', icono: '💅' },
    { value: 31, label: 'Seguros', tipo: 'gasto', icono: '🛡️' },
    { value: 36, label: 'Servicios digitales', tipo: 'gasto', icono: '💻' },
    { value: 33, label: 'Supermercados', tipo: 'gasto', icono: '🛒' },
    { value: 12, label: 'Tarjeta', tipo: 'gasto', icono: '💳' },
    { value: 18, label: 'Teléfono', tipo: 'gasto', icono: '📱' },
    { value: 19, label: 'Viajes', tipo: 'gasto', icono: '✈️' },
    { value: 10, label: 'Restaurantes y bares', tipo: 'gasto', icono: '🍽️' },
    { value: 39, label: 'Transferencias y bizums enviadas', tipo: 'gasto', icono: '📤' }
];
