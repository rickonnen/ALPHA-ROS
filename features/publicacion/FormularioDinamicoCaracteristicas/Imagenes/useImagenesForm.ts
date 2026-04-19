import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ImagenesValues, ImagenesErrors, INITIAL_VALUES, MAX_FILES } from './useImagenesTypes'
import { validate }                                                    from './useImagenesValidacion'
import {
  guardarImagenes,
  leerImagenes,
  limpiarImagenes,
  marcarSesionActiva,
  haySecionActiva,
} from './imagenesDB'

export function useImagenesForm() {
  const [values,     setValues]     = useState<ImagenesValues>(INITIAL_VALUES)
  const [errors,     setErrors]     = useState<ImagenesErrors>({})
  const [touched,    setTouched]    = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [cargando,   setCargando]   = useState(true) // true mientras lee IndexedDB

  const valuesRef = useRef(values)

  // ── Al montar: decide si restaurar o limpiar ──
  useEffect(() => {
    async function inicializar() {
      if (haySecionActiva()) {
        // El usuario recargó la página (F5) — restaurar imágenes de IndexedDB
        const archivosGuardados = await leerImagenes()
        if (archivosGuardados.length > 0) {
          const restored = { imagenes: archivosGuardados }
          valuesRef.current = restored
          setValues(restored)
        }
      } else {
        // El usuario entró de cero — limpiar IndexedDB por si quedó algo de antes
        await limpiarImagenes()
        // Marcar que hay una sesión activa
        // sessionStorage se borra solo cuando cierra la pestaña
        marcarSesionActiva()
      }
      setCargando(false)
    }

    inicializar()
  }, [])

  // ── Previews estables ─────────────────────────
  const previews = useMemo(
    () => values.imagenes.map(f => URL.createObjectURL(f)),
    [values.imagenes],
  )
  useEffect(() => {
    return () => { previews.forEach(url => URL.revokeObjectURL(url)) }
  }, [previews])

  const limitReached = values.imagenes.length >= MAX_FILES

  // ── Agregar imágenes ──────────────────────────
  const handleAgregar = useCallback(async (files: FileList | File[]) => {
    setFieldError(null)

    const arrFiles = Array.from(files)

    for (const file of arrFiles) {
      // Formato
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setFieldError('Solo se aceptan imágenes JPG y PNG.')
        return
      }
      // Límite
      if (valuesRef.current.imagenes.length >= MAX_FILES) {
        setFieldError(`No puedes agregar más de ${MAX_FILES} imágenes.`)
        return
      }

      const updated = {
        imagenes: [...valuesRef.current.imagenes, file].slice(0, MAX_FILES),
      }
      valuesRef.current = updated
      setValues(updated)

      // Guardar en IndexedDB para sobrevivir recarga
      await guardarImagenes(updated.imagenes)

      if (touched) setErrors(validate(updated))
    }
  }, [touched])

  // ── Eliminar imagen ───────────────────────────
  const handleEliminar = useCallback(async (indice: number) => {
    setFieldError(null)
    const updated = {
      imagenes: valuesRef.current.imagenes.filter((_, i) => i !== indice),
    }
    valuesRef.current = updated
    setValues(updated)

    // Actualizar IndexedDB con la lista sin la imagen eliminada
    await guardarImagenes(updated.imagenes)

    if (touched) setErrors(validate(updated))
  }, [touched])

  // ── Envío ─────────────────────────────────────
  const handleSubmit = useCallback((onSuccess: (values: ImagenesValues) => void) => {
    setTouched(true)
    const validationErrors = validate(valuesRef.current)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(valuesRef.current)
    }
  }, [])

  // ── Reset ─────────────────────────────────────
  const handleReset = useCallback(async () => {
    // Limpia IndexedDB y la sesión
    await limpiarImagenes()
    valuesRef.current = INITIAL_VALUES
    setValues(INITIAL_VALUES)
    setErrors({})
    setTouched(false)
    setFieldError(null)
  }, [])

  return {
    values,
    errors,
    touched,
    fieldError,
    cargando,      // usar para mostrar un spinner mientras restaura
    previews,
    limitReached,
    isValid: Object.keys(validate(values)).length === 0,
    handleAgregar,
    handleEliminar,
    handleSubmit,
    handleReset,
  }
}