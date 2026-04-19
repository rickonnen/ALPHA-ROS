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

export const MAX_CARACTERISTICAS = 4
export const PREDEFINED_FEATURES = [
  "Balcón", "Piscina", "Jardín", "Pet Friendly", "Gimnasio", "Terraza", "Ascensor"
]

// ── Tipos ─────────────────────────────────────────────────────
export interface CaracteristicaExtra {
  titulo: string;
  detalle: string;
}

export interface DescripcionFormValues {
  descripcion: string;
  caracteristicas: CaracteristicaExtra[];
}

export interface DescripcionFormErrors {
  descripcion?: string;
}

const INITIAL_VALUES: DescripcionFormValues = {
  descripcion: '',
  caracteristicas: [],
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
    return {
      descripcion: saved.descripcion || INITIAL_VALUES.descripcion,
      caracteristicas: saved.caracteristicas || INITIAL_VALUES.caracteristicas
    }
  })
  
  const [errors,  setErrors]  = useState<DescripcionFormErrors>({})
  const [touched, setTouched] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedTerm, setDebouncedTerm] = useState("")
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [caracteristicaError, setCaracteristicaError] = useState<string | null>(null)

  useEffect(() => {
    guardarSesion(values)
  }, [values])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setSugerencias([])
      return
    }
    const filtradas = PREDEFINED_FEATURES.filter(f => 
      f.toLowerCase().includes(debouncedTerm.toLowerCase())
    )
    setSugerencias(filtradas)
  }, [debouncedTerm])

  const handleChange = useCallback((value: string) => {
    setValues(prev => {
      const updated = { ...prev, descripcion: value }
      if (touched) setErrors(validate(updated))
      return updated
    })
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
    setSearchTerm("")
  }, [])

  // ── Funciones HU-03: Características ────────────────────────
  const agregarCaracteristica = useCallback((titulo: string) => {
    setCaracteristicaError(null)
    const tituloTrimmed = titulo.trim()
    if (!tituloTrimmed) return

    const actuales = values.caracteristicas

    if (actuales.some(c => c.titulo.toLowerCase() === tituloTrimmed.toLowerCase())) {
      setCaracteristicaError("Esta característica ya fue agregada.")
      return
    }
    if (actuales.length >= MAX_CARACTERISTICAS) {
      setCaracteristicaError("Alcanzaste el límite de 4 caracteristicas extras.")
      return
    }

    setValues(prev => ({
      ...prev,
      caracteristicas: [...prev.caracteristicas, { titulo: tituloTrimmed, detalle: "" }]
    }))
    setSearchTerm("")
    setSugerencias([])
  }, [values.caracteristicas])

  const eliminarCaracteristica = useCallback((titulo: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter(c => c.titulo !== titulo)
    }))
    setCaracteristicaError(null)
  }, [])

  const actualizarDetalle = useCallback((titulo: string, nuevoDetalle: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map(c => 
        c.titulo === titulo ? { ...c, detalle: nuevoDetalle } : c
      )
    }))
  }, [])

  // FUNCIÓN: Para poder editar el título de una etiqueta ya creada
  const actualizarTitulo = useCallback((tituloAnterior: string, nuevoTitulo: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map(c => 
        c.titulo === tituloAnterior ? { ...c, titulo: nuevoTitulo } : c
      )
    }))
  }, [])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    searchTerm, setSearchTerm,
    sugerencias, caracteristicaError,
    agregarCaracteristica, eliminarCaracteristica, actualizarDetalle, actualizarTitulo
  }
}