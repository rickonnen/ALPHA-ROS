import { CaracteristicasFormValues } from './useCaracteristicasTypes'

const SESSION_KEY = 'caracteristicasInmueble';

export function leerSesion(): {
  values:  Partial<Omit<CaracteristicasFormValues, 'imagenes'>>;
  touched: Partial<Record<keyof CaracteristicasFormValues, boolean>>;
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
  values:  CaracteristicasFormValues,
  touched: Partial<Record<keyof CaracteristicasFormValues, boolean>>,
): void {
  try {
    const { imagenes: _, ...rest } = values
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...rest, __touched: touched }))
  } catch {}
}

export function limpiarSesion(): void {
  sessionStorage.removeItem(SESSION_KEY)
}