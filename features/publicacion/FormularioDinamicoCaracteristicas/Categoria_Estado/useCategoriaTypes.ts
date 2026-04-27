export interface CategoriaFormValues {
  tipoPropiedad:   string
  estadoPropiedad: string
}

export interface CategoriaFormErrors {
  tipoPropiedad?:   string
  estadoPropiedad?: string
}

export const TIPOS_PROPIEDAD_VALIDOS = [
  "Casa",
  "Departamento",
  "Terreno",
  "Oficina",
] as const

export const ESTADOS_PROPIEDAD_VALIDOS = [
  "En Planos",
  "En Construccion",
  "Entrega Inmediata",
] as const

export const INITIAL_VALUES: CategoriaFormValues = {
  tipoPropiedad:   '',
  estadoPropiedad: '',
}