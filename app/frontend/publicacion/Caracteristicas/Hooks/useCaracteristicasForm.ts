import { useState, useCallback, useRef, useEffect, startTransition } from 'react'
import { CaracteristicasFormValues, CaracteristicasFormErrors, INITIAL_VALUES, MAX_IMAGENES } from './useCaracteristicasTypes'
import { validate } from './useCaracteristicasValidacion'
import { leerSesion, guardarSesion, limpiarSesion } from './useCaracteristicasPersistencia'

export function useCaracteristicasForm() {
  const [values,  setValues]  = useState<CaracteristicasFormValues>(INITIAL_VALUES);
  const [errors,  setErrors]  = useState<CaracteristicasFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CaracteristicasFormValues, boolean>>>({});

  const valuesRef  = useRef(values);
  const touchedRef = useRef(touched);

  useEffect(() => {
    const { values: savedValues, touched: savedTouched } = leerSesion()
    if (Object.keys(savedValues).length === 0) return
    const restored = { ...INITIAL_VALUES, ...savedValues }
    startTransition(() => {
      valuesRef.current  = restored
      touchedRef.current = savedTouched
      setValues(restored)
      setTouched(savedTouched)
      setErrors(validate(restored))
    })
  }, [])

  useEffect(() => {
    guardarSesion(valuesRef.current, touchedRef.current)
  }, [values, touched])

  const handleChange = useCallback(
    (field: keyof Omit<CaracteristicasFormValues, 'imagenes'>, value: string) => {
      const updated = { ...valuesRef.current, [field]: value };
      valuesRef.current = updated;
      setValues(updated);
      if (touchedRef.current[field] && field !== 'superficie') {
        setErrors((prev: CaracteristicasFormErrors) => ({ ...prev, [field]: validate(updated)[field] }));
      }
    }, [],
  );

  const handleAgregarImagenes = useCallback((nuevasImagenes: File[]) => {
    const actualizadas = [...valuesRef.current.imagenes, ...nuevasImagenes].slice(0, MAX_IMAGENES);
    const updated = { ...valuesRef.current, imagenes: actualizadas };
    valuesRef.current = updated;
    setValues(updated);
    if (touchedRef.current.imagenes) {
      setErrors((prev: CaracteristicasFormErrors) => ({ ...prev, imagenes: validate(updated).imagenes }));
    }
  }, []);

  const handleEliminarImagen = useCallback((indice: number) => {
    const actualizadas = valuesRef.current.imagenes.filter((_: File, i: number) => i !== indice);
    const updated = { ...valuesRef.current, imagenes: actualizadas };
    valuesRef.current = updated;
    setValues(updated);
    if (touchedRef.current.imagenes) {
      setErrors((prev: CaracteristicasFormErrors) => ({ ...prev, imagenes: validate(updated).imagenes }));
    }
  }, []);

  const handleBlur = useCallback((field: keyof CaracteristicasFormValues) => {
    const updatedTouched = { ...touchedRef.current, [field]: true }
    touchedRef.current = updatedTouched
    setTouched(updatedTouched);
    setErrors((prev: CaracteristicasFormErrors) => ({ ...prev, [field]: validate(valuesRef.current)[field] }));
  }, []);

  const handleSubmit = useCallback((onSuccess: (values: CaracteristicasFormValues) => void) => {
    const allTouched = Object.keys(INITIAL_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof CaracteristicasFormValues, boolean>,
    );
    touchedRef.current = allTouched
    setTouched(allTouched);
    const validationErrors = validate(valuesRef.current);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(valuesRef.current);
    }
  }, []);

  const handleReset = useCallback(() => {
    limpiarSesion()
    valuesRef.current  = INITIAL_VALUES
    touchedRef.current = {}
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
  }, []);

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(validate(values)).length === 0,
    puedeAgregarMas: values.imagenes.length < MAX_IMAGENES,
    handleChange,
    handleAgregarImagenes,
    handleEliminarImagen,
    handleBlur,
    handleSubmit,
    handleReset,
  };
}