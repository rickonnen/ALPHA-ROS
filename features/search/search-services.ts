export type SearchCurrency = 'USD' | 'BS';

export interface FiltrosPublicacion {
  ubicacion?: string;
  operacion?: string;
  tipoInmueble?: string;
  tipoInmuebleIds?: number[];
  habitaciones?: string;
  banos?: string;
  piscina?: string;
  currency?: SearchCurrency;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
}

export interface PublicacionBusqueda {
  id_publicacion: number;
  titulo?: string | null;
  descripcion?: string | null;
  precio?: number | null;
  superficie?: number | null;
  habitaciones?: number | null;
  banos?: number | null;
  garajes?: number | null;
  plantas?: number | null;
  tipo_inmueble?: string | null;
  tipo_operacion?: string | null;
  estado_construccion?: string | null;
  estado_publicacion?: string | null;
  moneda_nombre?: string | null;
  moneda_simbolo?: string | null;
  moneda_tasa_cambio?: number | null;
  fecha_creacion?: Date | string | null;
  ubicacion?: {
    direccion?: string | null;
    zona?: string | null;
    ciudad?: string | null;
    pais?: string | null;
    latitud?: number | null;
    longitud?: number | null;
  } | null;
  imagenes?: string[];
  caracteristicas?: string[];
  usuario?: {
    nombres?: string | null;
    apellidos?: string | null;
    email?: string | null;
    telefono?: string | null;
  } | null;
}

export interface PublicacionDetalleBusqueda {
  id_publicacion: number;
  titulo?: string;
  descripcion?: string;
  precio?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  garajes?: number;
  plantas?: number;
  tipo_inmueble?: string;
  tipo_operacion?: string;
  estado_construccion?: string;
  estado_publicacion?: string;
  moneda?: {
    nombre?: string;
    simbolo?: string;
    tasa_cambio?: number;
  };
  ubicacion?: {
    direccion?: string;
    zona?: string;
    ciudad?: string;
    pais?: string;
    latitud?: number;
    longitud?: number;
  };
  imagenes?: Array<{ url_imagen?: string }>;
  caracteristicas?: Array<{ nombre_caracteristica?: string }>;
  usuario?: {
    nombres?: string;
    apellidos?: string;
    email?: string;
    telefono?: string;
    url_foto_perfil?: string;
    username?: string;
  };
}

type SearchResponse = {
  success: boolean;
  publications?: PublicacionBusqueda[];
  total?: number;
  message?: string;
};

export async function buscarPublicaciones(
  filtros: FiltrosPublicacion,
): Promise<PublicacionBusqueda[]> {
  const response = await fetch('/api/filter_search_page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filtros),
  });

  const payload = (await response.json()) as SearchResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? 'No se pudo consultar las publicaciones');
  }

  return payload.publications ?? [];
}