import { useState, useCallback, useRef, useEffect, startTransition } from 'react'
import { CaracteristicasDetalleFormValues, CaracteristicasDetalleFormErrors, INITIAL_VALUES } from './useCaracteristicasDetalleTypes'
import { validate } from './useCaracteristicasDatalleValidacion'
import { leerSesion, guardarSesion, limpiarSesion } from './useCaracteristicasDetallePersistencia'

export function useCaracteristicasDetalleForm() {
  const [values, setValues] = useState<CaracteristicasDetalleFormValues>(INITIAL_VALUES ?? {
  habitaciones: '',
  banios:       '',
  plantas:      '',
  garajes:      '',
  superficie:   '',
})
  const [errors,  setErrors]  = useState<CaracteristicasDetalleFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CaracteristicasDetalleFormValues, boolean>>>({})

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

  const handleChange = useCallback((field: keyof CaracteristicasDetalleFormValues, value: string) => {
    const updated = { ...valuesRef.current, [field]: value }
    valuesRef.current = updated
    setValues(updated)
    if (touchedRef.current[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(updated)[field] }))
    }
  }, [])

  const handleBlur = useCallback((field: keyof CaracteristicasDetalleFormValues) => {
    const updatedTouched = { ...touchedRef.current, [field]: true }
    touchedRef.current = updatedTouched
    setTouched(updatedTouched)
    setErrors((prev) => ({ ...prev, [field]: validate(valuesRef.current)[field] }))
  }, [])

  const handleSubmit = useCallback((onSuccess: (values: CaracteristicasDetalleFormValues) => void) => {
    const allTouched = Object.keys(INITIAL_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof CaracteristicasDetalleFormValues, boolean>,
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
    isValid: values ? Object.keys(validate(values)).length === 0 : false,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
  }
}