// app/frontend/publicacion/informacion-comercial/informacionComercial.types.ts
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

export interface FormData {
  titulo: string;
  precio: string;
  tipoPropiedad: string;
  tipoOperacion: string;
  descripcion: string;
}

export interface FormErrors {
  titulo?: string;
  precio?: string;
  tipoPropiedad?: string;
  tipoOperacion?: string;
  descripcion?: string;
  general?: string;
}

export type FormField = keyof FormData;

export const TIPOS_PROPIEDAD = [...TIPOS_PROPIEDAD_VALIDOS] as const;
export const TIPOS_OPERACION = [...TIPOS_OPERACION_UI] as const;

export const TITULO_MIN = TITULO_MINIMO;
export const TITULO_MAX = TITULO_MAXIMO;
export const DESC_MIN = DESCRIPCION_MINIMA;
export const DESC_MAX = DESCRIPCION_MAXIMA;

export { PRECIO_MAXIMO, toTipoOperacionBackend };

export const FORM_INICIAL: FormData = {
  titulo: "",
  precio: "",
  tipoPropiedad: "",
  tipoOperacion: "",
  descripcion: "",
};

export interface InformacionComercialSuccessResponse {
  ok: true;
  mensaje: string;
  errores?: never;
  data?: {
    id_publicacion?: number;
  };
}

export interface InformacionComercialErrorResponse {
  ok: false;
  mensaje: string;
  errores?: Partial<Record<FormField, string>> & Record<string, string>;
}

export type InformacionComercialApiResponse =
  | InformacionComercialSuccessResponse
  | InformacionComercialErrorResponse;
