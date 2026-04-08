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
};

const EXCHANGE_RATE = 6.96; // 1 USD = 6.96 BS

type Currency = 'USD' | 'BS';

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
      // Solo incluir publicaciones que tengan ubicación válida
      return (
        pub.ubicacion?.latitud !== undefined &&
        pub.ubicacion?.longitud !== undefined &&
        pub.ubicacion.latitud !== null &&
        pub.ubicacion.longitud !== null
      );
    })
    .map((pub) => ({
      id: pub.id_publicacion,
      direccion: pub.ubicacion?.direccion || 'Ubicación no especificada',
      zona: pub.ubicacion?.zona || 'Zona desconocida',
      lat: Number(pub.ubicacion!.latitud),
      lng: Number(pub.ubicacion!.longitud),
      precio: formatPrice(pub.precio, pub.moneda_simbolo, currency),
    }));
}

/**
 * Formatea el precio con el símbolo de moneda y conversión
 */
function formatPrice(
  precio: number | null | undefined,
  simbolo: string | null | undefined,
  currency: Currency = 'USD',
): string {
  if (precio === null || precio === undefined) {
    return 'Precio no disponible';
  }

  // Convertir precio base (asumimos que viene en USD)
  let precioConvertido = precio;
  let symbolFinal = currency === 'USD' ? '$us' : 'Bs';

  if (currency === 'BS') {
    precioConvertido = precio * EXCHANGE_RATE;
  }

  if (precioConvertido >= 1_000_000) {
    return `${symbolFinal} ${(precioConvertido / 1_000_000).toFixed(1)}M`;
  }

  if (precioConvertido >= 1_000) {
    return `${symbolFinal} ${(precioConvertido / 1_000).toFixed(0)}K`;
  }

  return `${symbolFinal} ${precioConvertido.toFixed(0)}`;
}
