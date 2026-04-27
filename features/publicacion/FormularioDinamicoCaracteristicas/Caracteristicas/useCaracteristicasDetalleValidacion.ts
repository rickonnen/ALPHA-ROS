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

  if (!isTerreno) {
    if (values.habitaciones === '') {
      errors.habitaciones = 'Campo obligatorio'
    } else if (!esNumeroEnteroValido(values.habitaciones)) {
      errors.habitaciones = 'Entre 0 y 50'
    }

    if (values.banios === '') {
      errors.banios = 'Campo obligatorio'
    } else if (!esNumeroEnteroValido(values.banios)) {
      errors.banios = 'Entre 0 y 50'
    }

    if (values.plantas === '') {
      errors.plantas = 'Campo obligatorio'
    } else if (!esNumeroEnteroValido(values.plantas)) {
      errors.plantas = 'Entre 0 y 50'
    }

    if (values.garajes === '') {
      errors.garajes = 'Campo obligatorio'
    } else if (!esNumeroEnteroValido(values.garajes)) {
      errors.garajes = 'Entre 0 y 50'
    }
  }

  if (!values.superficie) {
    errors.superficie = 'Campo obligatorio'
  } else if (!esSuperficieValida(values.superficie)) {
    errors.superficie = 'Máximo 1.000.000 m²'
  }

  return errors
}