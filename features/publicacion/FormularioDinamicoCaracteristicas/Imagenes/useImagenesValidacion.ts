import {
  ImagenesValues, ImagenesErrors,
  MAX_FILES, MIN_FILES, ACCEPTED_TYPES,
  MAX_SIZE_BYTES, MAX_SIZE_TOTAL_BYTES,
  MIN_WIDTH, MIN_HEIGHT,
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
//peso total
const totalBytes = values.imagenes.reduce((acc, img) => acc + img.size, 0)
if (totalBytes > MAX_SIZE_TOTAL_BYTES) {
  errors.imagenes = 'El peso total de las imágenes no debe superar 10 MB.'
  return errors
} 
  for (const imagen of values.imagenes) {
    if (!ACCEPTED_TYPES.includes(imagen.type)) {
      errors.imagenes = 'Solo se permiten imágenes JPG y PNG.'
      return errors
    }
    if (imagen.size > MAX_SIZE_BYTES) {
      errors.imagenes = 'Cada imagen no debe superar 8 MB.'
      return errors
    }
  }

  return errors
}

// Validación de resolución mínima (asíncrona, se llama al agregar)
export function validateDimensions(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
        resolve(`"${file.name}" debe tener al menos ${MIN_WIDTH}×${MIN_HEIGHT}px.`)
      } else {
        resolve(null)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}