/**
 * @Dev: [OliverG]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Tipos, interfaces y constantes del formulario de Información Comercial.
 * Define la estructura de datos del formulario, errores, respuestas de la API
 * y constantes de validación importadas desde el backend para mantener sincronía.
 */

import {
  DESCRIPCION_MAXIMA,
  DESCRIPCION_MINIMA,
  PRECIO_MAXIMO,
  TITULO_MAXIMO,
  TITULO_MINIMO,
  TIPOS_OPERACION_UI,
  TIPOS_PROPIEDAD_VALIDOS,
  toTipoOperacionBackend,
} from "@/app/backend/publicacion/informacion-comercial/publicacion.constants";

// Estructura de datos del formulario
export interface FormData {
  titulo: string;
  precio: string;
  tipoPropiedad: string;
  tipoOperacion: string;
  descripcion: string;
}

// Mensajes de error por campo, incluye error general del servidor
export interface FormErrors {
  titulo?: string;
  precio?: string;
  tipoPropiedad?: string;
  tipoOperacion?: string;
  descripcion?: string;
  general?: string;
}

// Tipo que representa los nombres de los campos del formulario
export type FormField = keyof FormData;

// Opciones de los dropdowns sincronizadas con el backend
export const TIPOS_PROPIEDAD = [...TIPOS_PROPIEDAD_VALIDOS] as const;
export const TIPOS_OPERACION = [...TIPOS_OPERACION_UI] as const;

// Límites de validación sincronizados con el backend
export const TITULO_MIN = TITULO_MINIMO;
export const TITULO_MAX = TITULO_MAXIMO;
export const DESC_MIN = DESCRIPCION_MINIMA;
export const DESC_MAX = DESCRIPCION_MAXIMA;

// Re-exportar constantes del backend usadas en el hook
export { PRECIO_MAXIMO, toTipoOperacionBackend };

// Estado inicial vacío del formulario
export const FORM_INICIAL: FormData = {
  titulo: "",
  precio: "",
  tipoPropiedad: "",
  tipoOperacion: "",
  descripcion: "",
};

// Respuesta exitosa del endpoint POST
export interface InformacionComercialSuccessResponse {
  ok: true;
  mensaje: string;
  errores?: never;
  data?: {
    id_publicacion?: number;
  };
}

// Respuesta de error del endpoint POST con errores por campo
export interface InformacionComercialErrorResponse {
  ok: false;
  mensaje: string;
  errores?: Partial<Record<FormField, string>> & Record<string, string>;
}

// Tipo unión que representa cualquier respuesta posible del endpoint
export type InformacionComercialApiResponse =
  | InformacionComercialSuccessResponse
  | InformacionComercialErrorResponse;