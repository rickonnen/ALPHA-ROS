export const SK_STEP      = 'publicacion_currentStep'
export const SK_COMPLETED = 'publicacion_completedSteps'

export const SESSION_KEYS_TO_CLEAN = [
  SK_STEP, SK_COMPLETED, 'publicacion_sessionKey',
  'datosAviso', 'categoriaYEstado', 'ubicacion',
  'caracteristicasDetalle', 'imagenesPropiedad_interacted',
  'caracteristicasImagenesPreview', 'caracteristicasImagenesNombres',
  'videoPropiedad', 'descripcionPropiedad', 'imagenesIniciales',
]

export const ESTADO_IDS: Record<string, number> = {
  'En Planos': 1, 'En Construccion': 2, 'Entrega Inmediata': 3,
}

export const STEPS = [
  { title: 'Datos del Aviso',                 opcional: false },
  { title: 'Categoría y Estado',              opcional: false },
  { title: 'Ubicación de la Propiedad',       opcional: false },
  { title: 'Características de la Propiedad', opcional: false },
  { title: 'Imágenes de la Propiedad',        opcional: false },
  { title: 'Video de la Propiedad',           opcional: true  },
  { title: 'Descripción de la Propiedad',     opcional: false },
]

export const SIDEBAR_STEPS = [
  { title: 'Datos del Aviso *',    opcional: false },
  { title: 'Categoria y Estado *', opcional: false },
  { title: 'Ubicación *',          opcional: false },
  { title: 'Caracteristícas *',    opcional: false },
  { title: 'Imagenes *',           opcional: false },
  { title: 'Video',                opcional: true  },
  { title: 'Descripción *',        opcional: false },
]

export const C = {
  crema:    '#F4EFE6',
  terracota:'#C26E5A',
  marino:   '#1F3A4D',
  borde:    '#D4CFC6',
}

export function leerPaso(): number {
  try {
    const raw = sessionStorage.getItem(SK_STEP)
    const n   = raw !== null ? parseInt(raw, 10) : 0
    return isNaN(n) ? 0 : n
  } catch { return 0 }
}

export function guardarPaso(step: number) {
  try { sessionStorage.setItem(SK_STEP, String(step)) } catch { }
}

export function leerCompletados(): Set<number> {
  try {
    const raw = sessionStorage.getItem(SK_COMPLETED)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch { return new Set() }
}

export function guardarCompletados(set: Set<number>) {
  try { sessionStorage.setItem(SK_COMPLETED, JSON.stringify([...set])) } catch { }
}

export function parseIntNullableClient(val: string | undefined | null): number | null {
  if (val === undefined || val === null || val === '') return null
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}