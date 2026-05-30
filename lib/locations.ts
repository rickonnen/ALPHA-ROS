/**
 * Tipos y conversores para manejar datos de ubicaciones de publicaciones
 * Este archivo trabaja con datos reales de la base de datos vía Prisma
 */

import type { PublicacionBusqueda } from '@/features/search/search-services';

export type Location = {
  id: number;
  direccion: string;
  zona: string;
  lat: number;
  lng: number;
  precio: string;
  title: string;
  type: string;
  location: string;
  terrainArea: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
};

const EXCHANGE_RATE = 6.96; // 1 USD = 6.96 BS

type Currency = 'USD' | 'BS';

function toNumber(value: number | null | undefined): number {
  return value ?? 0;
}

export function formatPropertyPrice(
  price: number | null | undefined,
  currency: Currency = 'USD',
): string {
  if (price === null || price === undefined) {
    return 'Precio no disponible';
  }

  const convertedPrice =
    currency === 'USD'
      ? price
      : Math.round(price * EXCHANGE_RATE * 100) / 100;

  const displayCurrencySymbol = currency === 'USD' ? '$us' : 'Bs';

  return `${displayCurrencySymbol} ${convertedPrice.toLocaleString('es-BO')}`;
}

/**
 * Convierte las publicaciones del endpoint de búsqueda al formato Location
 * que utiliza el componente de mapa
 */
export function convertPublicacionesToLocations(
  publicaciones: PublicacionBusqueda[],
  currency: Currency = 'USD',
): Location[] {
  return publicaciones
    .filter((pub) => {
  const lat = Number(pub.ubicacion?.latitud);
  const lng = Number(pub.ubicacion?.longitud);
  return (
    pub.ubicacion?.latitud !== undefined &&
    pub.ubicacion?.longitud !== undefined &&
    pub.ubicacion.latitud !== null &&
    pub.ubicacion.longitud !== null &&
    !isNaN(lat) && !isNaN(lng) &&
    isFinite(lat) && isFinite(lng) &&
    lat !== 0 && lng !== 0
  );
})
    .map((pub) => ({
      id: pub.id_publicacion,
      direccion: pub.ubicacion?.direccion || 'Ubicación no especificada',
      zona: pub.ubicacion?.zona || 'Zona desconocida',
      lat: Number(pub.ubicacion!.latitud),
      lng: Number(pub.ubicacion!.longitud),
      precio: formatPropertyPrice(pub.precio, currency),
      title: pub.titulo || 'Sin título',
      type: `${pub.tipo_inmueble ?? 'Inmueble'} en ${pub.tipo_operacion ?? 'operación no especificada'}`,
      location: [
        pub.ubicacion?.direccion,
        pub.ubicacion?.zona,
        pub.ubicacion?.ciudad,
        pub.ubicacion?.pais,
      ]
        .filter(Boolean)
        .join(', ') || 'Ubicación no disponible',
      terrainArea: toNumber(pub.superficie),
      bedrooms: pub.habitaciones ?? 0,
      bathrooms: pub.banos ?? 0,
      images:
        pub.imagenes?.filter((image): image is string => Boolean(image)) ?? [],
    }));
}
