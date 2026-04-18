import { CaracteristicasDetalleFormValues } from './useCaracteristicasDetalleTypes'

const SESSION_KEY = 'caracteristicasDetalle'

export function leerSesion(): {
  values:  Partial<CaracteristicasDetalleFormValues>
  touched: Partial<Record<keyof CaracteristicasDetalleFormValues, boolean>>
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
  values:  CaracteristicasDetalleFormValues,
  touched: Partial<Record<keyof CaracteristicasDetalleFormValues, boolean>>,
): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...values, __touched: touched }))
  } catch {}
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY)
}