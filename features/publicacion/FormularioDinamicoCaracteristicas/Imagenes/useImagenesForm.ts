import { useState, useCallback, useRef, useEffect, startTransition, useMemo } from 'react'
import { ImagenesValues, ImagenesErrors, INITIAL_VALUES, MAX_FILES } from './useImagenesTypes'
import { validate, validateImageDimensions }                          from './useImagenesValidacion'
import { marcarInteraccion, leerInteraccion, limpiarInteraccion }     from './useImagenesPersistencia'

export function useImagenesForm() {
  const [values,     setValues]     = useState<ImagenesValues>(INITIAL_VALUES)
  const [errors,     setErrors]     = useState<ImagenesErrors>({})
  const [touched,    setTouched]    = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [wasVisited, setWasVisited] = useState(false)

  const valuesRef = useRef(values)

  // Detectar si el usuario había subido imágenes y recargó la página
  useEffect(() => {
    const interacted = leerInteraccion()
    if (interacted && valuesRef.current.imagenes.length === 0) {
      startTransition(() => setWasVisited(true))
    } else {
      limpiarInteraccion()
    }
  }, [])

  // URLs de preview estables — evita re-renders que pierden archivos
  const previews = useMemo(
    () => values.imagenes.map(f => URL.createObjectURL(f)),
    [values.imagenes],
  )
  useEffect(() => {
    return () => { previews.forEach(url => URL.revokeObjectURL(url)) }
  }, [previews])

  const limitReached = values.imagenes.length >= MAX_FILES

  const handleAgregar = useCallback(async (files: FileList | File[]) => {
    setFieldError(null)
    setWasVisited(false)

    const arrFiles = Array.from(files)

    for (const file of arrFiles) {
      // Formato
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setFieldError('Solo se aceptan imágenes JPG y PNG.')
        return
      }
      // Peso
      if (file.size > 10 * 1024 * 1024) {
        setFieldError('El archivo supera el peso máximo de 10 MB.')
        return
      }
      // Límite
      if (valuesRef.current.imagenes.length >= MAX_FILES) {
        setFieldError(`No puedes agregar más de ${MAX_FILES} imágenes.`)
        return
      }
      // Dimensiones y aspecto
      const { ok, error: dimError } = await validateImageDimensions(file)
      if (!ok) {
        setFieldError(dimError ?? 'Imagen no válida.')
        return
      }

      const updated = {
        imagenes: [...valuesRef.current.imagenes, file].slice(0, MAX_FILES),
      }
      valuesRef.current = updated
      setValues(updated)
      marcarInteraccion()

      if (touched) {
        setErrors(validate(updated))
      }
    }
  }, [touched])

  const handleEliminar = useCallback((indice: number) => {
    setFieldError(null)
    const updated = {
      imagenes: valuesRef.current.imagenes.filter((_, i) => i !== indice),
    }
    if (updated.imagenes.length === 0) {
      limpiarInteraccion()
      setWasVisited(false)
    }
    valuesRef.current = updated
    setValues(updated)
    if (touched) setErrors(validate(updated))
  }, [touched])

  const handleSubmit = useCallback((onSuccess: (values: ImagenesValues) => void) => {
    setTouched(true)
    const validationErrors = validate(valuesRef.current)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      onSuccess(valuesRef.current)
    }
  }, [])

  const handleReset = useCallback(() => {
    limpiarInteraccion()
    valuesRef.current = INITIAL_VALUES
    setValues(INITIAL_VALUES)
    setErrors({})
    setTouched(false)
    setFieldError(null)
    setWasVisited(false)
  }, [])

  return {
    values,
    errors,
    touched,
    fieldError,
    wasVisited,
    previews,
    limitReached,
    isValid: Object.keys(validate(values)).length === 0,
    handleAgregar,
    handleEliminar,
    handleSubmit,
    handleReset,
  }
}