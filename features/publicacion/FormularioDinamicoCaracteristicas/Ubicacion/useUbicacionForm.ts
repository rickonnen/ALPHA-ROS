import { useState, useCallback, useRef, useEffect, startTransition } from 'react'
import {
  UbicacionValues,
  UbicacionErrors,
  INITIAL_VALUES,
} from './useUbicacionTypes'
import { validate }                                  from './useUbicacionValidacion'
import { leerSesion, guardarSesion, limpiarSesion } from './useUbicacionPersistencia'

export function useUbicacionForm() {
  const [values,  setValues]  = useState<UbicacionValues>(INITIAL_VALUES)
  const [errors,  setErrors]  = useState<UbicacionErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof UbicacionValues, boolean>>>({})

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

  const handleChange = useCallback((field: keyof UbicacionValues, value: string) => {
    const updated = { ...valuesRef.current, [field]: value }
    valuesRef.current = updated
    setValues(updated)
    if (touchedRef.current[field]) {
      const errs = validate(updated) as Record<string, string | undefined>
      setErrors(prev => ({ ...prev, [field]: errs[field] }))
    }
  }, [])

  // Cuando el mapa selecciona ubicación — setea dirección, lat y lng
  const handleUbicacion = useCallback((data: {
    lat:       number
    lng:       number
    direccion: string
    ciudad:    string
    pais:      string
  }) => {
    const updated = {
      ...valuesRef.current,
      direccion: data.direccion,
      lat:       data.lat.toString(),
      lng:       data.lng.toString(),
    }
    valuesRef.current = updated
    const updatedTouched = { ...touchedRef.current, direccion: true }
    touchedRef.current = updatedTouched
    setValues(updated)
    setTouched(updatedTouched)
    setErrors(prev => ({ ...prev, direccion: validate(updated).direccion }))
  }, [])

  const handleBlur = useCallback((field: keyof UbicacionValues) => {
    const updatedTouched = { ...touchedRef.current, [field]: true }
    touchedRef.current = updatedTouched
    setTouched(updatedTouched)
    const errs = validate(valuesRef.current) as Record<string, string | undefined>
    setErrors(prev => ({ ...prev, [field]: errs[field] }))
  }, [])

  const handleSubmit = useCallback((onSuccess: (values: UbicacionValues) => void) => {
    const allTouched = Object.keys(INITIAL_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof UbicacionValues, boolean>,
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
    handleUbicacion,
    handleBlur,
    handleSubmit,
    handleReset,
  }
}