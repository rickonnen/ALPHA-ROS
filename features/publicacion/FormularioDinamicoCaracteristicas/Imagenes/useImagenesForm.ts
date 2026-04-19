import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ImagenesValues, ImagenesErrors, INITIAL_VALUES, MAX_FILES } from './useImagenesTypes'
import { validate }                                                    from './useImagenesValidacion'
import {
  guardarImagenes,
  leerImagenes,
  limpiarImagenes,
  guardarSessionKey,
  leerSessionKey,
} from './imagenesDB'

// ── CAMBIO CLAVE ──────────────────────────────────────────────────────────
// El hook recibe `sessionKey` del padre (FormularioDinamico).
// El padre genera una key única con Date.now() al montar.
//
// Lógica al inicializar:
//   - keyGuardada === sessionKey  →  F5/recarga  →  restaurar de IndexedDB
//   - keyGuardada !== sessionKey  →  sesión nueva →  limpiar IndexedDB
//
// Esto reemplaza el bug de haySecionActiva() que siempre devolvía true
// durante la navegación interna de Next.js (soft navigation).
// ─────────────────────────────────────────────────────────────────────────

export function useImagenesForm(sessionKey: string) {
  const [values,     setValues]     = useState<ImagenesValues>(INITIAL_VALUES)
  const [errors,     setErrors]     = useState<ImagenesErrors>({})
  const [touched,    setTouched]    = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [cargando,   setCargando]   = useState(true)

  const valuesRef = useRef(values)

  useEffect(() => {
    if (!sessionKey) return

    async function inicializar() {
      setCargando(true)

      const keyGuardada = leerSessionKey()

      if (keyGuardada === sessionKey) {
        // Misma sesión (F5 / recarga) → restaurar de IndexedDB
        const archivosGuardados = await leerImagenes()
        if (archivosGuardados.length > 0) {
          const restored = { imagenes: archivosGuardados }
          valuesRef.current = restored
          setValues(restored)
        }
      } else {
        // Sesión nueva (otra publicación, otro editar, click en header)
        // → limpiar IndexedDB y registrar la nueva key
        await limpiarImagenes()
        guardarSessionKey(sessionKey)
        valuesRef.current = INITIAL_VALUES
        setValues(INITIAL_VALUES)
      }

      setCargando(false)
    }

    inicializar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey])

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
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setFieldError('Solo se aceptan imágenes JPG y PNG.')
        return
      }
      if (valuesRef.current.imagenes.length >= MAX_FILES) {
        setFieldError(`No puedes agregar más de ${MAX_FILES} imágenes.`)
        return
      }

      const updated = {
        imagenes: [...valuesRef.current.imagenes, file].slice(0, MAX_FILES),
      }
      valuesRef.current = updated
      setValues(updated)

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

    await guardarImagenes(updated.imagenes)

    if (touched) setErrors(validate(updated))
  }, [touched])

  //Envío
  const handleSubmit = useCallback((onSuccess: (values: ImagenesValues) => void) => {
    setTouched(true)
    const validationErrors = validate(valuesRef.current)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(valuesRef.current)
    }
  }, [])

  //Reset
  const handleReset = useCallback(async () => {
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
    cargando,
    previews,
    limitReached,
    isValid: Object.keys(validate(values)).length === 0,
    handleAgregar,
    handleEliminar,
    handleSubmit,
    handleReset,
  }
}