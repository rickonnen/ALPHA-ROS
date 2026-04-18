import {
  ImagenesValues,
  ImagenesErrors,
  MAX_FILES,
  MIN_FILES,
  ACCEPTED_TYPES,
  MAX_SIZE_BYTES,
} from './useImagenesTypes'

// ── Validación de formulario ──────────────────
// Sin restricciones de resolución ni proporción
export function validate(values: ImagenesValues): ImagenesErrors {
  const errors: ImagenesErrors = {}

  if (values.imagenes.length < MIN_FILES) {
    errors.imagenes = `Debes subir al menos ${MIN_FILES} imagen.`
    return errors
  }
  if (values.imagenes.length > MAX_FILES) {
    errors.imagenes = `No puedes subir más de ${MAX_FILES} imágenes.`
    return errors
  }
  for (const imagen of values.imagenes) {
    if (!ACCEPTED_TYPES.includes(imagen.type)) {
      errors.imagenes = 'Solo se permiten imágenes JPG y PNG.'
      return errors
    }
    if (imagen.size > MAX_SIZE_BYTES) {
      errors.imagenes = 'Cada imagen no debe superar 10 MB.'
      return errors
    }
  }

  return errors
}

// ── validateImageDimensions eliminada ────────
// Ya no se valida resolución mínima ni proporción (4:3 / 16:9)
// Si en el futuro se necesita volver a activar,
// restaurar la función del sprint anterior