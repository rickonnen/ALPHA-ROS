export type Departamento = 'beni' | 'chuquisaca' | 'cochabamba' | 'la_paz' | 'oruro' | 'pando' | 'potosi' | 'santa_cruz' | 'tarija' | '';

export interface CaracteristicasFormValues {
  direccion:    string;
  superficie:   string;
  departamento: Departamento;
  zona:         string;
  habitaciones: string;
  banios:       string;
  plantas:      string;
  garajes:      string;
  imagenes:     File[];
}

export interface CaracteristicasFormErrors {
  direccion?:    string;
  superficie?:   string;
  departamento?: string;
  zona?:         string;
  habitaciones?: string;
  banios?:       string;
  plantas?:      string;
  garajes?:      string;
  imagenes?:     string;
}

export const DEPARTAMENTOS: { label: string; value: Departamento }[] = [
  { label: 'Beni',       value: 'beni'       },
  { label: 'Chuquisaca', value: 'chuquisaca' },
  { label: 'Cochabamba', value: 'cochabamba' },
  { label: 'La Paz',     value: 'la_paz'     },
  { label: 'Oruro',      value: 'oruro'      },
  { label: 'Pando',      value: 'pando'      },
  { label: 'Potosí',     value: 'potosi'     },
  { label: 'Santa Cruz', value: 'santa_cruz' },
  { label: 'Tarija',     value: 'tarija'     },
]

export const TIPOS_IMAGEN_PERMITIDOS  = ['image/jpeg', 'image/png'];
export const TAMANO_MAXIMO_IMAGEN_MB  = 10;
export const MIN_IMAGENES             = 1;
export const MAX_IMAGENES             = 5;
export const MAX_CARACTERES_ZONA      = 100;
export const MAX_VALOR_NUMERICO       = 50;
export const MIN_RESOLUCION_ANCHO     = 1280;
export const MIN_RESOLUCION_ALTO      = 720;
export const MIN_CARACTERES_DIRECCION = 10;
export const MAX_CARACTERES_DIRECCION = 200;

export const INITIAL_VALUES: CaracteristicasFormValues = {
  direccion:    '',
  superficie:   '',
  departamento: '',
  zona:         '',
  habitaciones: '',
  banios:       '',
  plantas:      '',
  garajes:      '',
  imagenes:     [],
};