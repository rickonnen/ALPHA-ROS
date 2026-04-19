
export const SESSION_INTERACTED_KEY = 'imagenesPropiedad_interacted'

export function marcarInteraccion(): void {
  try { sessionStorage.setItem(SESSION_INTERACTED_KEY, 'true') } catch {}
}

export function leerInteraccion(): boolean {
  try { return sessionStorage.getItem(SESSION_INTERACTED_KEY) === 'true' } catch { return false }
}

export function limpiarInteraccion(): void {
  try { sessionStorage.removeItem(SESSION_INTERACTED_KEY) } catch {}
}