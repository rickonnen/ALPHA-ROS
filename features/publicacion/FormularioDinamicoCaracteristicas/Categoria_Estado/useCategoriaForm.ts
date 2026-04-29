import { useState, useCallback, useRef, useEffect, startTransition } from 'react'
import { CategoriaFormValues, CategoriaFormErrors, INITIAL_VALUES } from './useCategoriaTypes'
import { validate } from './useCategoriaValidacion'
import { leerSesion, guardarSesion, limpiarSesion } from './useCategoriaPersistencia'

export function useCategoriaForm() {
  const [values,  setValues]  = useState<CategoriaFormValues>(INITIAL_VALUES)
  const [errors,  setErrors]  = useState<CategoriaFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CategoriaFormValues, boolean>>>({})

  const valuesRef  = useRef(values)
  const touchedRef = useRef(touched)

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

  const handleChange = useCallback((field: keyof CategoriaFormValues, value: string) => {
    const updated = { ...valuesRef.current, [field]: value }
    valuesRef.current = updated
    setValues(updated)
    if (touchedRef.current[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(updated)[field] }))
    }
  }, [])

  const handleBlur = useCallback((field: keyof CategoriaFormValues) => {
    const updatedTouched = { ...touchedRef.current, [field]: true }
    touchedRef.current = updatedTouched
    setTouched(updatedTouched)
    setErrors((prev) => ({ ...prev, [field]: validate(valuesRef.current)[field] }))
  }, [])

  const handleSubmit = useCallback((onSuccess: (values: CategoriaFormValues) => void) => {
    const allTouched = Object.keys(INITIAL_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof CategoriaFormValues, boolean>,
    )
    touchedRef.current = allTouched
    setTouched(allTouched)
    const validationErrors = validate(valuesRef.current)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(valuesRef.current)
    }
  }, [])

  const handleReset = useCallback(() => {
    limpiarSesion()
    valuesRef.current  = INITIAL_VALUES
    touchedRef.current = {}
    setValues(INITIAL_VALUES)
    setErrors({})
    setTouched({})
  }, [])

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(validate(values)).length === 0,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
  }
}