import { UbicacionValues, UbicacionErrors } from './useUbicacionTypes'

export const MIN_ZONA = 5

export function validate(values: UbicacionValues): UbicacionErrors {
  const errors: UbicacionErrors = {}

  if (!values.direccion.trim()) {
    errors.direccion = 'Selecciona una ubicación en el mapa.'
  }

  if (!values.departamento) {
    errors.departamento = 'Selecciona un departamento.'
  }

  if (!values.zona.trim()) {
    errors.zona = 'La zona es obligatoria.'
  } else if (values.zona.trim().length < MIN_ZONA) {
    errors.zona = `La zona debe tener al menos ${MIN_ZONA} caracteres.`
  } else if (values.zona.trim().length > 100) {
    errors.zona = 'La zona no puede superar 100 caracteres.'
  }

  return errors
}