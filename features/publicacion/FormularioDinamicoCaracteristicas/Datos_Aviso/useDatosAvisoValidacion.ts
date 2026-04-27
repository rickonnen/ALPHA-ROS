import {
  DatosAvisoValues,
  DatosAvisoErrors,
  MAX_TITULO,
  MIN_TITULO,
  MAX_PRECIO,
} from './useDatosAvisoTypes'

export function validate(values: DatosAvisoValues): DatosAvisoErrors {
  const errors: DatosAvisoErrors = {}

  // Título
  if (!values.titulo.trim()) {
    errors.titulo = 'El título es obligatorio.'
  } else if (values.titulo.trim().length < MIN_TITULO) {
    errors.titulo = `El título debe tener al menos ${MIN_TITULO} caracteres.`
  } else if (values.titulo.length > MAX_TITULO) {
    errors.titulo = `El título no puede superar ${MAX_TITULO} caracteres.`
  }

  // Tipo de operación
  if (!values.tipoOperacion) {
    errors.tipoOperacion = 'Selecciona un tipo de operación.'
  }

  // Precio
  if (!values.precio) {
    errors.precio = 'Campo obligatorio'
  } else if (isNaN(parseFloat(values.precio)) || parseFloat(values.precio) <= 0) {
    errors.precio = 'El precio debe ser mayor a 0.'
  } else if (parseFloat(values.precio) > MAX_PRECIO) {
    errors.precio = `El precio no puede superar ${MAX_PRECIO.toLocaleString()}.`
  }

  return errors
}