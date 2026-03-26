// app/frontend/publicacion/informacion-comercial/informacionComercial.types.ts

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
}

export const TIPOS_PROPIEDAD = ["Casa", "Departamento", "Terreno", "Oficina"] as const;
export const TIPOS_OPERACION = ["Venta", "Alquiler", "Anticretico"] as const;

export const PRECIO_MAXIMO = 9_999_999;
export const TITULO_MIN    = 10;
export const TITULO_MAX    = 150;
export const DESC_MIN      = 10;
export const DESC_MAX      = 1500;

export const FORM_INICIAL: FormData = {
  titulo:        "",
  precio:        "",
  tipoPropiedad: "",
  tipoOperacion: "",
  descripcion:   "",
};