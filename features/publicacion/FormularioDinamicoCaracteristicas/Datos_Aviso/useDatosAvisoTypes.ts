
export type TipoMoneda = 'USD' | 'Bs'

export interface DatosAvisoValues {
  titulo:         string
  tipoOperacion:  string
  precio:         string
  tipoMoneda:     TipoMoneda
}

//Cambiado: derivado de DatosAvisoValues para que keyof coincida
export type DatosAvisoErrors = Partial<Record<keyof DatosAvisoValues, string>>

export const TIPOS_OPERACION = ['Venta', 'Alquiler', 'Anticrético'] as const

export const MAX_TITULO  = 150
export const MIN_TITULO  = 5
export const MAX_PRECIO  = 99999999

export const INITIAL_VALUES: DatosAvisoValues = {
  titulo:        '',
  tipoOperacion: '',
  precio:        '',
  tipoMoneda:    'USD',
}

export const SESSION_KEY = 'datosAviso'