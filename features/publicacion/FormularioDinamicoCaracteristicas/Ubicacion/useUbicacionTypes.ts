
// Tipos, interfaces y constantes del paso Ubicación

export interface UbicacionValues {
  direccion:    string
  lat:          string
  lng:          string
  departamento: string
  zona:         string
}

// Solo los campos que se validan — lat y lng no se validan directamente
export interface UbicacionErrors {
  direccion?:    string
  departamento?: string
  zona?:         string
}

export const DEPARTAMENTOS = [
  'Beni',
  'Chuquisaca',
  'Cochabamba',
  'La Paz',
  'Oruro',
  'Pando',
  'Potosí',
  'Santa Cruz',
  'Tarija',
] as const

export const MAX_ZONA = 100

export const INITIAL_VALUES: UbicacionValues = {
  direccion:    '',
  lat:          '',
  lng:          '',
  departamento: '',
  zona:         '',
}

export const SESSION_KEY = 'ubicacion'