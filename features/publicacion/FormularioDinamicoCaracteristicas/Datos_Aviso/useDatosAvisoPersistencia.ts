import { DatosAvisoValues, SESSION_KEY } from './useDatosAvisoTypes'

export function leerSesion(): {
  values:  Partial<DatosAvisoValues>
  touched: Partial<Record<keyof DatosAvisoValues, boolean>>
} {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return { values: {}, touched: {} }
    const { __touched, ...rest } = JSON.parse(raw)
    return { values: rest, touched: __touched ?? {} }
  } catch {
    return { values: {}, touched: {} }
  }
}

export function guardarSesion(
  values:  DatosAvisoValues,
  touched: Partial<Record<keyof DatosAvisoValues, boolean>>,
): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...values, __touched: touched }))
  } catch {}
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY)
}