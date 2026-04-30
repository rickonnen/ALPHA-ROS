export interface CaracteristicasDetalleFormValues {
  habitaciones: string
  banios:       string
  plantas:      string
  garajes:      string
  superficie:   string
}

export interface CaracteristicasDetalleFormErrors {
  habitaciones?: string
  banios?:       string
  plantas?:      string
  garajes?:      string
  superficie?:   string
}

export const MAX_VALOR_NUMERICO = 50
export const MAX_SUPERFICIE     = 1000000

export const INITIAL_VALUES: CaracteristicasDetalleFormValues = {
  habitaciones: '',
  banios:       '',
  plantas:      '',
  garajes:      '',
  superficie:   '',
}