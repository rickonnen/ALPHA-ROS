// NOTE:
// This module is consumed by client components.
// Keep this file free of server-only imports (dto, route, prisma, next/server).

export const TITULO_MINIMO = 10;
export const TITULO_MAXIMO = 150;
export const DESCRIPCION_MINIMA = 10;
export const DESCRIPCION_MAXIMA = 1500;
export const PRECIO_MAXIMO = 9_999_999;

export const TIPOS_PROPIEDAD_VALIDOS = [
  "Casa",
  "Departamento",
  "Terreno",
  "Oficina",
] as const;

export const TIPOS_OPERACION_BACKEND = [
  "Venta",
  "Alquiler",
  "Anticretico",
] as const;

const OPERATION_LABELS: Record<string, string> = {
  Anticretico: "Anticr\u00e9tico",
};

export const TIPOS_OPERACION_UI = TIPOS_OPERACION_BACKEND.map(
  (value) => OPERATION_LABELS[value] ?? value
);

const TIPO_OPERACION_UI_TO_BACKEND = TIPOS_OPERACION_BACKEND.reduce<Record<string, string>>(
  (acc, value) => {
    const label = OPERATION_LABELS[value] ?? value;
    acc[label] = value;
    return acc;
  },
  {}
);

export function toTipoOperacionBackend(value: string): string {
  return TIPO_OPERACION_UI_TO_BACKEND[value] ?? value;
}
