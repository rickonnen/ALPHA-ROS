import { UbicacionValues, UbicacionErrors } from './useUbicacionTypes'

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
  } else if (values.zona.trim().length > 100) {
    errors.zona = 'La zona no puede superar 100 caracteres.'
  }

  return errors
}