import React, { useRef, useState } from 'react';

const FormField = ({
                       label,
                       name,
                       type = 'text',
                       register = () => {}, 
                       error,
                       placeholder = '',
                       options = [],
                       accept,
                       disabled,
                       step,
                       prefix,
                       suffix,
                       hint,
                       className = '',
                   }) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const inputClasses = `w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 ${
        error ? 'border-error' : 'border-neutral-300'
    } ${prefix ? 'pl-10' : 'px-3'} ${suffix ? 'pr-10' : ''} py-2 ${className}`;

    if (typeof register !== 'function') {
        console.error(`El prop 'register' no se pasó correctamente al campo "${name}".`);
    }

    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {prefix && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {prefix}
                    </div>
                )}

                {type === 'select' ? (
                    <select
                        id={name}
                        name={name}
                        {...register(name)}
                        disabled={disabled}
                        className={inputClasses}
                    >
                        <option value="" disabled>
                            {placeholder || 'Seleccione una opción'}
                        </option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'file' ? (
                    <>
                        <input
                            ref={fileInputRef}
                            id={name}
                            name={name}
                            type="file"
                            onChange={handleFileChange}
                            accept={accept}
                            disabled={disabled}
                            className="hidden"
                        />
                        <div
                            onClick={() => !disabled && fileInputRef.current.click()}
                            className={`w-full border px-3 py-2 rounded-md shadow-sm ${
                                !disabled ? 'cursor-pointer hover:bg-gray-50' : 'bg-neutral-100 cursor-not-allowed'
                            } ${error ? 'border-error' : 'border-neutral-300'}`}
                        >
                            {fileName || placeholder || 'Seleccionar archivo'}
                        </div>
                    </>
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        {...register(name)}
                        placeholder={placeholder}
                        disabled={disabled}
                        step={step}
                        className={inputClasses}
                    />
                )}

                {suffix && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {suffix}
                    </div>
                )}
            </div>

            {error && <p className="text-error text-xs mt-1">{error}</p>}
            {hint && <p className="text-neutral-600 text-xs mt-1">{hint}</p>}
        </div>
    );
};

export default FormField;
