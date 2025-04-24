import { useState, useEffect } from 'react';

const useForm = (initialValues, validate, onSubmitCallback) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se ejecuta cada vez que cambian los errores o se dispara un submit
  useEffect(() => {
    // Si no hay errores y se ha intentado enviar, ejecutamos el callback
    if (isSubmitting && Object.keys(errors).length === 0) {
      onSubmitCallback(); // función personalizada que se pasa desde fuera
      setIsSubmitting(false);
    } else if (isSubmitting) {
      setIsSubmitting(false); // Evitamos que se quede en true si hay errores
    }
  }, [errors, isSubmitting, onSubmitCallback]);

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  // Maneja el blur de los inputs
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors({
      ...errors,
      [name]: validate({ ...values, [name]: value })[name],
    });
  };

  // Maneja el submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setIsSubmitting(true);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleBlur,
  };
};

export default useForm;
