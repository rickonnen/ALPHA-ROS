import {
  CategoriaFormValues,
  CategoriaFormErrors,
  TIPOS_PROPIEDAD_VALIDOS,
  ESTADOS_PROPIEDAD_VALIDOS,
} from './useCategoriaTypes'

export function validate(values: CategoriaFormValues): CategoriaFormErrors {
  const errors: CategoriaFormErrors = {}

  if (!values.tipoPropiedad) {
    errors.tipoPropiedad = 'Selecciona el tipo de propiedad.'
  } else if (!(TIPOS_PROPIEDAD_VALIDOS as readonly string[]).includes(values.tipoPropiedad)) {
    errors.tipoPropiedad = 'Tipo de propiedad no válido.'
  }

  if (!values.estadoPropiedad) {
    errors.estadoPropiedad = 'Selecciona el estado de la propiedad.'
  } else if (!(ESTADOS_PROPIEDAD_VALIDOS as readonly string[]).includes(values.estadoPropiedad)) {
    errors.estadoPropiedad = 'Estado de propiedad no válido.'
  }

  return errors
}