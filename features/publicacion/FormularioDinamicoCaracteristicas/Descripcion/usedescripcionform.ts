/**
 * Tipos, persistencia y hook del formulario de descripción.
 * Todo en un solo archivo para evitar conflictos de casing en Windows.
 */
'use client'

import { useState, useCallback, useEffect } from 'react'

// ── Constantes ────────────────────────────────────────────────
export const MAX_DESCRIPCION  = 1500
export const MIN_DESCRIPCION  = 20
const        SESSION_KEY      = 'descripcionPropiedad'

// ── Tipos ─────────────────────────────────────────────────────
export interface DescripcionFormValues {
  descripcion: string
}

export interface DescripcionFormErrors {
  descripcion?: string
}

const INITIAL_VALUES: DescripcionFormValues = {
  descripcion: '',
}

// ── Validación ────────────────────────────────────────────────
function validate(values: DescripcionFormValues): DescripcionFormErrors {
  const errors: DescripcionFormErrors = {}
  const desc = values.descripcion.trim()
  if (!desc) {
    errors.descripcion = 'La descripción es obligatoria.'
  } else if (desc.length < MIN_DESCRIPCION) {
    errors.descripcion = `Mínimo ${MIN_DESCRIPCION} caracteres.`
  }
  return errors
}

// ── Persistencia ──────────────────────────────────────────────
function leerSesion(): Partial<DescripcionFormValues> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function guardarSesion(values: DescripcionFormValues): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(values))
  } catch {}
}

function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

// ── Hook ──────────────────────────────────────────────────────
export function useDescripcionForm() {
  const [values,  setValues]  = useState<DescripcionFormValues>(() => {
    const saved = leerSesion()
    return saved.descripcion ? { descripcion: saved.descripcion } : INITIAL_VALUES
  })
  const [errors,  setErrors]  = useState<DescripcionFormErrors>({})
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    guardarSesion(values)
  }, [values])

  const handleChange = useCallback((value: string) => {
    const updated = { descripcion: value }
    setValues(updated)
    if (touched) setErrors(validate(updated))
  }, [touched])

  const handleBlur = useCallback(() => {
    setTouched(true)
    setErrors(validate(values))
  }, [values])

  const handleSubmit = useCallback((onSuccess: (values: DescripcionFormValues) => void) => {
    setTouched(true)
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(values)
    }
  }, [values])

  const handleReset = useCallback(() => {
    limpiarSesion()
    setValues(INITIAL_VALUES)
    setErrors({})
    setTouched(false)
  }, [])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
  }
}