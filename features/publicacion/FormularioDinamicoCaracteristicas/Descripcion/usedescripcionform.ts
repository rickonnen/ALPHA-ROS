/**
 * Tipos, persistencia y hook del formulario de descripción.
 *
 * CAMBIOS v2:
 *  - actualizarTitulo RESTAURADO en el return del hook.
 *    Permite cambiar el título de una característica existente (solo desde la UI
 *    que valida contra PREDEFINED_FEATURES — no texto libre).
 *  - Filtro startsWith ya funciona correctamente.
 *  - CaracteristicaExtra incluye id_caracteristica (ID real de BD).
 */
'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

// ── Constantes ────────────────────────────────────────────────
export const MAX_DESCRIPCION     = 1500
export const MIN_DESCRIPCION     = 20
const        SESSION_KEY         = 'descripcionPropiedad'
export const MAX_CARACTERISTICAS = 4

// IDs y nombres reales de la tabla "Caracteristica" en BD
export const PREDEFINED_FEATURES: { id: number; nombre: string }[] = [
  { id: 1,  nombre: 'Piscina' },
  { id: 2,  nombre: 'Jardín' },
  { id: 3,  nombre: 'Parqueo' },
  { id: 4,  nombre: 'Amoblado' },
  { id: 5,  nombre: 'Vista panorámica' },
  { id: 6,  nombre: 'Seguridad 24h' },
  { id: 7,  nombre: 'Ascensor' },
  { id: 8,  nombre: 'Amoblado' },
  { id: 9,  nombre: 'A estrenar' },
  { id: 10, nombre: 'Remodelado' },
  { id: 11, nombre: 'Terraza' },
  { id: 12, nombre: 'Balcón' },
  { id: 13, nombre: 'Patio' },
  { id: 14, nombre: 'Parrillero' },
  { id: 15, nombre: 'Jacuzzi' },
  { id: 16, nombre: 'Gimnasio' },
  { id: 17, nombre: 'Sauna' },
  { id: 18, nombre: 'Área social' },
  { id: 19, nombre: 'Salón eventos' },
  { id: 20, nombre: 'Lavandería' },
  { id: 21, nombre: 'Cocina equipada' },
  { id: 22, nombre: 'Cocina americana' },
  { id: 23, nombre: 'Walk-in closet' },
  { id: 24, nombre: 'Baño privado' },
  { id: 25, nombre: 'Aire acondicionado' },
  { id: 26, nombre: 'Calefacción' },
  { id: 27, nombre: 'Gas domiciliario' },
  { id: 28, nombre: 'Agua potable' },
  { id: 29, nombre: 'Internet' },
  { id: 30, nombre: 'Cisterna' },
  { id: 31, nombre: 'Depósito' },
  { id: 32, nombre: 'Vista ciudad' },
  { id: 33, nombre: 'Vista montaña' },
  { id: 34, nombre: 'Zona residencial' },
  { id: 35, nombre: 'Zona comercial' },
  { id: 36, nombre: 'Transporte cercano' },
  { id: 37, nombre: 'Colegios cerca' },
  { id: 38, nombre: 'Hospitales cerca' },
  { id: 39, nombre: 'Parques cerca' },
  { id: 40, nombre: 'Frente parque' },
  { id: 41, nombre: 'Condominio cerrado' },
  { id: 42, nombre: 'Control acceso' },
  { id: 43, nombre: 'Portón eléctrico' },
  { id: 44, nombre: 'Cámaras seguridad' },
  { id: 45, nombre: 'Alarma' },
  { id: 46, nombre: 'Parqueo visitas' },
  { id: 47, nombre: 'Área infantil' },
  { id: 48, nombre: 'Cancha fútbol' },
  { id: 49, nombre: 'Cancha tenis' },
  { id: 50, nombre: 'Cancha básquet' },
  { id: 51, nombre: 'Estudio' },
  { id: 52, nombre: 'Dúplex' },
  { id: 53, nombre: 'Último piso' },
  { id: 54, nombre: 'Planta baja' },
  { id: 55, nombre: 'Urbanizado' },
  { id: 56, nombre: 'Pavimentado' },
  { id: 57, nombre: 'Perimetrado' }
]

// ── Tipos ─────────────────────────────────────────────────────
export interface CaracteristicaExtra {
  id_caracteristica: number
  titulo:            string
  detalle:           string
}

export interface DescripcionFormValues {
  descripcion:     string
  caracteristicas: CaracteristicaExtra[]
}

export interface DescripcionFormErrors {
  descripcion?: string
}

const INITIAL_VALUES: DescripcionFormValues = {
  descripcion:     '',
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
  const [values, setValues] = useState<DescripcionFormValues>(() => {
    const saved = leerSesion()
    return {
      descripcion:     saved.descripcion     || INITIAL_VALUES.descripcion,
      caracteristicas: saved.caracteristicas || INITIAL_VALUES.caracteristicas,
    }
  })

  const [errors,  setErrors]  = useState<DescripcionFormErrors>({})
  const [touched, setTouched] = useState(false)

  const [searchTerm,    setSearchTerm]    = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [caracteristicaError, setCaracteristicaError] = useState<string | null>(null)

  // Persistir en sessionStorage
  useEffect(() => {
    guardarSesion(values)
  }, [values])

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Sugerencias derivadas (startsWith)
  const sugerencias = useMemo<string[]>(() => {
    if (!debouncedTerm.trim()) return []
    const term = debouncedTerm.toLowerCase()
    return PREDEFINED_FEATURES
      .filter(f => f.nombre.toLowerCase().startsWith(term))
      .map(f => f.nombre)
  }, [debouncedTerm])

  // ── Handlers básicos ──────────────────────────────────────────
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
    setSearchTerm('')
  }, [])

  // ── Características Extras ─────────────────────────────────────
  const agregarCaracteristica = useCallback((nombreSugerido: string) => {
    setCaracteristicaError(null)
    const nombreTrimmed = nombreSugerido.trim()
    if (!nombreTrimmed) return

    const feature = PREDEFINED_FEATURES.find(
      f => f.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
    )
    if (!feature) {
      setCaracteristicaError('Selecciona una característica de la lista.')
      return
    }

    setValues(prev => {
      if (prev.caracteristicas.some(
        c => c.titulo.toLowerCase() === nombreTrimmed.toLowerCase()
      )) {
        setCaracteristicaError('Esta característica ya fue agregada.')
        return prev
      }
      if (prev.caracteristicas.length >= MAX_CARACTERISTICAS) {
        setCaracteristicaError('Alcanzaste el límite de 4 características extras.')
        return prev
      }
      return {
        ...prev,
        caracteristicas: [
          ...prev.caracteristicas,
          { id_caracteristica: feature.id, titulo: feature.nombre, detalle: '' },
        ],
      }
    })
    setSearchTerm('')
  }, [])

  const eliminarCaracteristica = useCallback((titulo: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter(c => c.titulo !== titulo),
    }))
    setCaracteristicaError(null)
  }, [])

  const actualizarDetalle = useCallback((titulo: string, nuevoDetalle: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map(c =>
        c.titulo === titulo ? { ...c, detalle: nuevoDetalle } : c
      ),
    }))
  }, [])

  /**
   * Cambia el título de una característica existente.
   * La UI es responsable de validar que nuevoTitulo esté en PREDEFINED_FEATURES.
   * Aquí también actualizamos el id_caracteristica al ID correcto del nuevo nombre.
   */
  const actualizarTitulo = useCallback((tituloActual: string, nuevoTitulo: string) => {
    const feature = PREDEFINED_FEATURES.find(
      f => f.nombre.toLowerCase() === nuevoTitulo.toLowerCase()
    )
    if (!feature) return // no debería llegar texto libre aquí

    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map(c =>
        c.titulo === tituloActual
          ? { ...c, id_caracteristica: feature.id, titulo: feature.nombre }
          : c
      ),
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
    searchTerm,  setSearchTerm,
    sugerencias, caracteristicaError,
    agregarCaracteristica,
    eliminarCaracteristica,
    actualizarDetalle,
    actualizarTitulo,   // ← restaurado para cambio controlado de título
  }
}