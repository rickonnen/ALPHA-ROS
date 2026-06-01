import { CategoriaFormValues } from './useCategoriaTypes'

const SESSION_KEY = 'categoriaYEstado'

export function leerSesion(): {
  values:  Partial<CategoriaFormValues>
  touched: Partial<Record<keyof CategoriaFormValues, boolean>>
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
  values:  CategoriaFormValues,
  touched: Partial<Record<keyof CategoriaFormValues, boolean>>,
): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...values, __touched: touched }))
  } catch {}
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY)
}