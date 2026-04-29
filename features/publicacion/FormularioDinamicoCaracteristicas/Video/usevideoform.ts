/**
 * Hook del formulario de video.
 * Persiste la URL en sessionStorage y expone handleURLChange.
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { VideoFormValues, INITIAL_VALUES }   from './usevideotypes'
import { leerSesion, guardarSesion, limpiarSesion } from './usevideopersistencia'

export function useVideoForm() {
  // Inicialización lazy: lee sessionStorage una sola vez al montar
  const [values, setValues] = useState<VideoFormValues>(() => {
    const saved = leerSesion()
    return saved.url ? { url: saved.url } : INITIAL_VALUES
  })

  // Persistir cada vez que cambia la URL
  useEffect(() => {
    guardarSesion(values)
  }, [values])

  const handleURLChange = useCallback((url: string) => {
    setValues({ url })
  }, [])

  const handleReset = useCallback(() => {
    limpiarSesion()
    setValues(INITIAL_VALUES)
  }, [])

  return {
    values,
    handleURLChange,
    handleReset,
  }
}