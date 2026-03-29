/**
 * @Dev: [BenjaminA]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Constantes compartidas entre frontend y backend para el módulo
 * de publicación de inmuebles. Este archivo es consumido por componentes cliente,
 * por lo que no debe contener imports de servidor (dto, prisma, next/server).
 */

// Límites de validación del formulario sincronizados con el backend
export const TITULO_MINIMO = 10;
export const TITULO_MAXIMO = 150;
export const DESCRIPCION_MINIMA = 10;
export const DESCRIPCION_MAXIMA = 1500;
export const PRECIO_MAXIMO = 9_999_999;

// Opciones válidas de tipo de propiedad para el formulario
export const TIPOS_PROPIEDAD_VALIDOS = [
  "Casa",
  "Departamento",
  "Terreno",
  "Oficina",
] as const;

// Valores internos del backend para tipo de operación
export const TIPOS_OPERACION_BACKEND = [
  "Venta",
  "Alquiler",
  "Anticretico",
] as const;

// Etiquetas visibles en la UI para cada tipo de operación
const OPERATION_LABELS: Record<(typeof TIPOS_OPERACION_BACKEND)[number], string> = {
  Venta:      "Venta",
  Alquiler:   "Alquiler",
  Anticretico: "Anticrético",
};

// Lista de etiquetas UI para poblar el dropdown de tipo de operación
export const TIPOS_OPERACION_UI = TIPOS_OPERACION_BACKEND.map(
  (strValue) => OPERATION_LABELS[strValue] ?? strValue
);

// Mapa inverso: etiqueta UI → valor backend (para el envío al servidor)
const TIPO_OPERACION_UI_TO_BACKEND = TIPOS_OPERACION_BACKEND.reduce<Record<string, string>>(
  (objAcc, strValue) => {
    const strLabel = OPERATION_LABELS[strValue] ?? strValue;
    objAcc[strLabel] = strValue;
    return objAcc;
  },
  {}
);

/**
 * @Funcionalidad: Convierte el valor UI de tipo de operación al valor esperado por el backend
 * @param {string} strValue - Etiqueta UI (ej: "Anticrético")
 * @return {string} Valor backend (ej: "Anticretico")
 */
export function toTipoOperacionBackend(strValue: string): string {
  return TIPO_OPERACION_UI_TO_BACKEND[strValue] ?? strValue;
}