import { useState, useCallback, useRef, useEffect, startTransition } from 'react'
import {
  DatosAvisoValues,
  DatosAvisoErrors,
  TipoMoneda,
  INITIAL_VALUES,
} from './useDatosAvisoTypes'
import { validate }                          from './useDatosAvisoValidacion'
import { leerSesion, guardarSesion, limpiarSesion } from './useDatosAvisoPersistencia'

export function useDatosAvisoForm() {
  const [values,  setValues]  = useState<DatosAvisoValues>(INITIAL_VALUES)
  const [errors,  setErrors]  = useState<DatosAvisoErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof DatosAvisoValues, boolean>>>({})

  const valuesRef  = useRef(values)
  const touchedRef = useRef(touched)

  // Restaurar sesión al montar
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

  // Guardar sesión cada vez que cambian values o touched
  useEffect(() => {
    guardarSesion(valuesRef.current, touchedRef.current)
  }, [values, touched])

  // Cambio de campo de texto
  const handleChange = useCallback((field: keyof DatosAvisoValues, value: string) => {
    const updated = { ...valuesRef.current, [field]: value }
    valuesRef.current = updated
    setValues(updated)
    if (touchedRef.current[field]) {
      setErrors(prev => ({ ...prev, [field]: validate(updated)[field] }))
    }
  }, [])

  // Cambio de tipo de moneda (USD / Bs)
  const handleMoneda = useCallback((moneda: TipoMoneda) => {
    const updated = { ...valuesRef.current, tipoMoneda: moneda }
    valuesRef.current = updated
    setValues(updated)
  }, [])

  // Blur — marca el campo como tocado y valida
  const handleBlur = useCallback((field: keyof DatosAvisoValues) => {
    const updatedTouched = { ...touchedRef.current, [field]: true }
    touchedRef.current = updatedTouched
    setTouched(updatedTouched)
    setErrors(prev => ({ ...prev, [field]: validate(valuesRef.current)[field] }))
  }, [])

  // Submit — valida todo y llama onSuccess si no hay errores
  const handleSubmit = useCallback((onSuccess: (values: DatosAvisoValues) => void) => {
    const allTouched = Object.keys(INITIAL_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof DatosAvisoValues, boolean>,
    )
    touchedRef.current = allTouched
    setTouched(allTouched)
    const validationErrors = validate(valuesRef.current)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(valuesRef.current)
    }
  }, [])

  // Reset
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
    handleMoneda,
    handleBlur,
    handleSubmit,
    handleReset,
  }
}