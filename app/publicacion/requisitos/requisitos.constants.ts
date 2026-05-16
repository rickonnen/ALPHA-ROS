export const PUBLICACION_REQUISITOS_ROUTE = "/publicacion/requisitos";
export const PUBLICACION_FORM_ROUTE = "/publicacion/formularioPublicacion";
export const PUBLICACION_REQUISITOS_SESSION_KEY = "publicacion_requisitos_confirmados";

export const TIPOS_INMUEBLE = [
  "Casa",
  "Departamento",
  "Terreno",
  "Oficina",
] as const;

export type TipoInmueble = (typeof TIPOS_INMUEBLE)[number];

export const REQUISITOS_GENERALES = [
  "Fotos en buena calidad tanto de exterior como interior (min 1, max 5)",
  "Dirección exacta y referencia de ubicación",
  "Precio en Dolares o Bolivianos",
  "Video de tu inmueble (Opcional)",
];

export const REQUISITOS_ESPECIFICOS: Record<TipoInmueble, string[]> = {
  Casa: [
    "Título de la propiedad",
    "Superficie de construcción en m²",
    "Nro. de habitaciones, baños y garajes",
    "Estado de construcción",
  ],
  Departamento: [
    "Título de la propiedad",
    "Superficie total del departamento en m²",
    "Nro. de habitaciones, baños y garajes",
    "Piso y estado de construcción",
  ],
  Terreno: [
    "Título de la propiedad",
    "Superficie total del terreno en m²",
    "Ubicación y referencias de acceso",
    "Servicios cercanos",
  ],
  Oficina: [
    "Título de la propiedad",
    "Superficie de la oficina en m²",
    "Piso, ambientes y baños",
    "Estado de construcción",
  ],
};
