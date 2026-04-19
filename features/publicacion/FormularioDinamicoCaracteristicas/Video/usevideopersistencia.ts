import { VideoFormValues, SESSION_KEY } from './usevideotypes'

export function leerSesion(): Partial<VideoFormValues> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function guardarSesion(values: VideoFormValues): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(values))
  } catch {}
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY)
}