
// Tipos, interfaces y constantes del paso 5 — Imágenes
export interface ImagenesValues {
  imagenes: File[]
}

export interface ImagenesErrors {
  imagenes?: string
}

export const MAX_FILES        = 5
export const MIN_FILES        = 1
export const MAX_SIZE_BYTES   = 10 * 1024 * 1024  // 10 MB
export const MIN_WIDTH        = 1280
export const MIN_HEIGHT       = 720
export const ACCEPTED_TYPES   = ['image/jpeg', 'image/png']
export const ACCEPTED_RATIOS  = [4 / 3, 16 / 9]
export const RATIO_TOLERANCE  = 0.02
export const SESSION_KEY      = 'imagenesPropiedad'

export const INITIAL_VALUES: ImagenesValues = {
  imagenes: [],
}