import React, { useRef, useState } from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder = '',
  options = [],
  accept,
}) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
    onChange(e);
  };

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 ${
            error ? 'border-error' : 'border-neutral-300'
          }`}
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
        <div className="relative">
          <input
            ref={fileInputRef}
            id={name}
            name={name}
            type="file"
            onChange={handleFileChange}
            onBlur={onBlur}
            accept={accept}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current.click()}
            className={`w-full border px-3 py-2 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 ${
              error ? 'border-error' : 'border-neutral-300'
            }`}
          >
            {fileName || placeholder || 'Seleccionar archivo'}
          </div>
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 ${
            error ? 'border-error' : 'border-neutral-300'
          }`}
        />
      )}

      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
