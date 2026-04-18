/**
 * Tipos, interfaces y constantes del formulario de video.
 */

export interface VideoFormValues {
  url: string
}

export interface VideoFormErrors {
  url?: string
}

export const INITIAL_VALUES: VideoFormValues = {
  url: '',
}

export const SESSION_KEY = 'videoPropiedad'