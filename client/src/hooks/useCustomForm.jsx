import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function useCustomForm({ schema, onSubmit, defaultValues = {} }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        errors,
        isSubmitting,
        reset
    };
}
