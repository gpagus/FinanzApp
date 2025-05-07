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


export const TIPOS_TRANSACCION = [
    {value: 'ingreso', label: 'Ingreso'},
    {value: 'gasto', label: 'Gasto'}
];

export const CATEGORIAS = [
    {value: 'alimentacion', label: 'Alimentación', icono: '🍽️'},
    {value: 'transporte', label: 'Transporte', icono: '🚌'},
    {value: 'ocio', label: 'Ocio', icono: '🎮'},
    {value: 'hogar', label: 'Hogar', icono: '🏠'},
    {value: 'salud', label: 'Salud', icono: '🩺'},
    {value: 'otros', label: 'Otros', icono: '🗂️'}
];
