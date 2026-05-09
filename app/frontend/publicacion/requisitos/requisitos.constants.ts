import { TIPOS_PROPIEDAD_VALIDOS } from "@/app/backend/publicacion/informacion-comercial/publicacion.constants";

export const PUBLICACION_REQUISITOS_SESSION_KEY = "publicacion_requisitos_confirmado";
export const PUBLICACION_REQUISITOS_ROUTE = "/frontend/publicacion/requisitos";
export const PUBLICACION_FORM_ROUTE = "/frontend/publicacion/informacion-comercial";
export const LOGIN_ROUTE = "/frontend/auth/sing-in-up";

export type TipoInmueble = (typeof TIPOS_PROPIEDAD_VALIDOS)[number];
export const TIPOS_INMUEBLE = [...TIPOS_PROPIEDAD_VALIDOS] as const;

export const REQUISITOS_ESPECIFICOS: Record<TipoInmueble, string[]> = {
  Casa: [
    "Título de tu propiedad",
    "Superficie en m²",
    "N° de habitaciones/baños/ambientes/garaje",
    "Descripción y Características",
  ],
  Departamento: [
    "Título de tu propiedad",
    "Superficie en m²",
    "N° de habitaciones/baños/ambientes/garaje",
    "Descripción y Características",
  ],
  Terreno: [
    "Título de tu propiedad",
    "Superficie en m²",
    "Descripción y Características",
  ],
  Oficina: [
    "Título de tu propiedad",
    "Superficie en m²",
    "Piso de Oficina",
    "Descripción y Características",
  ],
};

export const REQUISITOS_GENERALES = [
  "Fotos en buena calidad exterior e interior (min 1, max 5)",
  "Dirección exacta y referencia de ubicación",
  "Precio en Dólares o Bolivianos",
  "Video de tu inmueble (Opcional)",
] as const;
