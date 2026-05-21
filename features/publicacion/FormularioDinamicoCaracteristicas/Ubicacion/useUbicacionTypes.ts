
// Tipos, interfaces y constantes del paso Ubicación

export interface UbicacionValues {
  direccion:    string
  lat:          string
  lng:          string
  departamento: string
  zona:         string
  puntosInteres: PuntoInteresForm[]
}

export interface PuntoInteresTipoOption {
  id_tipo_poi: number
  nombre: string
  icono?: string | null
  color?: string | null
}

export interface PuntoInteresForm {
  tempId: string
  id_tipo_poi: number
  tipo_nombre: string
  tipo_icono?: string | null
  tipo_color?: string | null
  nombre: string
  descripcion: string
  lat: number
  lng: number
  direccion?: string
  ciudad?: string
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
export const MAX_PUNTOS_INTERES = 5

export const INITIAL_VALUES: UbicacionValues = {
  direccion:    '',
  lat:          '',
  lng:          '',
  departamento: '',
  zona:         '',
  puntosInteres: [],
}

export const SESSION_KEY = 'ubicacion'
