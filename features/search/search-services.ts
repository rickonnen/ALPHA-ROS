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
  const response = await fetch('@C:\dev\test\alpha-ros-deploy\app\api\filter_search_page\route.ts', {
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
