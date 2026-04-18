
import {
  ImagenesValues,
  ImagenesErrors,
  MAX_FILES,
  MIN_FILES,
  ACCEPTED_TYPES,
  MAX_SIZE_BYTES,
} from './useImagenesTypes'

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

// Reutilizada del sprint anterior — valida dimensiones y aspecto
export function validateImageDimensions(
  file: File,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      if (width < 1280 || height < 720) {
        URL.revokeObjectURL(url)
        return resolve({
          ok:    false,
          error: `Resolución mínima 1280×720px. Tu imagen: ${width}×${height}px.`,
        })
      }
      const ratio      = width / height
      const ratioValid = [4 / 3, 16 / 9].some(r => Math.abs(ratio - r) <= 0.02)
      if (!ratioValid) {
        URL.revokeObjectURL(url)
        return resolve({
          ok:    false,
          error: 'Solo se permiten proporciones 4:3 o 16:9.',
        })
      }
      URL.revokeObjectURL(url)
      resolve({ ok: true })
    }
    img.src = url
  })
}