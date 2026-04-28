import { useState, useCallback, useRef, useEffect, startTransition } from 'react'
import { CaracteristicasDetalleFormValues, CaracteristicasDetalleFormErrors, INITIAL_VALUES } from './useCaracteristicasDetalleTypes'
import { validate } from './useCaracteristicasDetalleValidacion'
import { leerSesion, guardarSesion, limpiarSesion } from './useCaracteristicasDetallePersistencia'

function getTipoPropiedad(): string {
  try {
    const raw = sessionStorage.getItem('categoriaYEstado')
    if (!raw) return ''
    return JSON.parse(raw).tipoPropiedad ?? ''
  } catch {
    return ''
  }
}

export function useCaracteristicasDetalleForm() {
  const [values,  setValues]  = useState<CaracteristicasDetalleFormValues>(INITIAL_VALUES ?? {
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

    const isTerreno = getTipoPropiedad() === 'Terreno'

    const restored: CaracteristicasDetalleFormValues = isTerreno
      ? { ...INITIAL_VALUES, ...savedValues, habitaciones: '', banios: '', garajes: '', plantas: '' }
      : { ...INITIAL_VALUES, ...savedValues }

    // Si es Terreno → los campos bloqueados no necesitan touched
    // Si NO es Terreno y venía de Terreno → los campos estaban vacíos,
    // resetear touched para que los errores no aparezcan hasta que el usuario toque el campo
    const restoredTouched: Partial<Record<keyof CaracteristicasDetalleFormValues, boolean>> = isTerreno
      ? savedTouched
      : {
          // Solo conservar touched de campos que tengan valor guardado
          habitaciones: !!savedValues.habitaciones ? savedTouched.habitaciones : false,
          banios:       !!savedValues.banios        ? savedTouched.banios       : false,
          garajes:      !!savedValues.garajes       ? savedTouched.garajes      : false,
          plantas:      !!savedValues.plantas       ? savedTouched.plantas      : false,
          superficie:   savedTouched.superficie,
        }

    startTransition(() => {
      valuesRef.current  = restored
      touchedRef.current = restoredTouched
      setValues(restored)
      setTouched(restoredTouched)
      setErrors(validate(restored))
    })

    guardarSesion(restored, restoredTouched)
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

    const isTerreno = getTipoPropiedad() === 'Terreno'
    const currentValues: CaracteristicasDetalleFormValues = isTerreno
      ? { ...valuesRef.current, habitaciones: '', banios: '', garajes: '', plantas: '' }
      : valuesRef.current

    valuesRef.current = currentValues
    setValues(currentValues)
    guardarSesion(currentValues, allTouched)

    const validationErrors = validate(currentValues)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(currentValues)
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