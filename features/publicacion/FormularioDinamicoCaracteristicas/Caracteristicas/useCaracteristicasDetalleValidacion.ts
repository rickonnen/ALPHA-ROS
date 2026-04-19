import {
  CaracteristicasDetalleFormValues,
  CaracteristicasDetalleFormErrors,
} from './useCaracteristicasDetalleTypes'

function esNumeroEnteroValido(valor: string): boolean {
  return /^\d+$/.test(valor) && parseInt(valor, 10) >= 0 && parseInt(valor, 10) <= 50
}

function esSuperficieValida(valor: string): boolean {
  const limpio = parseInt(valor.replace(/\./g, ''), 10)
  return !isNaN(limpio) && limpio > 0 && limpio <= 1000000
}

function getTipoPropiedad(): string {
  try {
    const raw = sessionStorage.getItem('categoriaYEstado')
    if (!raw) return ''
    return JSON.parse(raw).tipoPropiedad ?? ''
  } catch {
    return ''
  }
}

export function validate(values: CaracteristicasDetalleFormValues): CaracteristicasDetalleFormErrors {
  const errors: CaracteristicasDetalleFormErrors = {}
  const isTerreno = getTipoPropiedad() === 'Terreno'

  // Para Terreno los campos habitaciones/banios/garajes/plantas están deshabilitados
  // y se envían como null → no se validan
  if (!isTerreno) {
    if (values.habitaciones === '') {
      errors.habitaciones = 'El número de habitaciones es obligatorio.'
    } else if (!esNumeroEnteroValido(values.habitaciones)) {
      errors.habitaciones = 'Debe ser un número entre 0 y 50'
    }

    if (values.banios === '') {
      errors.banios = 'El número de baños es obligatorio.'
    } else if (!esNumeroEnteroValido(values.banios)) {
      errors.banios = 'Debe ser un número entre 0 y 50'
    }

    if (values.plantas === '') {
      errors.plantas = 'El número de plantas es obligatorio.'
    } else if (!esNumeroEnteroValido(values.plantas)) {
      errors.plantas = 'Debe ser un número entre 0 y 50.'
    }

    if (values.garajes === '') {
      errors.garajes = 'El número de garajes es obligatorio.'
    } else if (!esNumeroEnteroValido(values.garajes)) {
      errors.garajes = 'Debe ser un número entre 0 y 50'
    }
  }

  if (!values.superficie) {
    errors.superficie = 'La superficie es obligatoria.'
  } else if (!esSuperficieValida(values.superficie)) {
    errors.superficie = 'Debe ser un número mayor a 0 y máximo 1.000.000 m².'
  }

  return errors
}