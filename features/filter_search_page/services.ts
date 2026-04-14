import { Prisma } from '@prisma/client';

import { convertBsToUsd } from './currencyConverter';
import { prisma } from './prismaClient';

export type SearchCurrency = 'USD' | 'BS';

export type SearchFiltersInput = {
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
};

export type SearchPublicationResult = {
  id_publicacion: number;
  titulo: string | null;
  descripcion: string | null;
  precio: number | null;
  superficie: number | null;
  habitaciones: number | null;
  banos: number | null;
  garajes: number | null;
  plantas: number | null;
  tipo_inmueble: string | null;
  tipo_operacion: string | null;
  estado_construccion: string | null;
  estado_publicacion: string | null;
  moneda_nombre: string | null;
  moneda_simbolo: string | null;
  moneda_tasa_cambio: number | null;
  ubicacion: {
    direccion: string | null;
    zona: string | null;
    ciudad: string | null;
    pais: string | null;
    latitud: number | null;
    longitud: number | null;
  } | null;
  imagenes: string[];
  caracteristicas: string[];
};

type PublicationWithRelations = Prisma.PublicacionGetPayload<{
  include: {
    TipoInmueble: true;
    TipoOperacion: true;
    EstadoConstruccion: true;
    EstadoPublicacion: true;
    Moneda: true;
    Ubicacion: {
      include: {
        Ciudad: true;
        Pais: true;
      };
    };
    Imagen: true;
    PublicacionCaracteristica: {
      include: {
        Caracteristica: true;
      };
    };
  };
}>;

const OPERACION_ID: Record<string, number> = {
  venta: 2,
  'en venta': 2,
  compra: 2,
  alquiler: 1,
  'en alquiler': 1,
  anticretico: 3,
};

const TIPO_INMUEBLE_ID: Record<string, number> = {
  casa: 1,
  departamento: 2,
  terreno: 3,
};

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value == null) {
    return null;
  }

  return typeof value === 'number' ? value : value.toNumber();
}

function parseMinimum(value: string): number | null {
  const match = value.match(/\+?(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getPropertyTypeNames(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildWhere(filters: SearchFiltersInput): Prisma.PublicacionWhereInput {
  const where: Prisma.PublicacionWhereInput = {
    id_estado: 1,
  };

  if (filters.operacion) {
    const operationId = OPERACION_ID[normalizeText(filters.operacion)];
    if (operationId) {
      where.id_tipo_operacion = operationId;
    }
  }

  const propertyTypeNames = getPropertyTypeNames(filters.tipoInmueble);

  if (filters.tipoInmuebleIds && filters.tipoInmuebleIds.length > 0) {
    where.id_tipo_inmueble = {
      in: filters.tipoInmuebleIds,
    };
  } else if (propertyTypeNames.length > 0) {
    const mappedIds = propertyTypeNames
      .map((name) => TIPO_INMUEBLE_ID[normalizeText(name)])
      .filter((id): id is number => Boolean(id));

    if (mappedIds.length === propertyTypeNames.length) {
      where.id_tipo_inmueble = mappedIds.length === 1 ? mappedIds[0] : { in: mappedIds };
    } else {
      where.TipoInmueble = {
        is: {
          OR: propertyTypeNames.map((name) => ({
            nombre_inmueble: {
              equals: name,
              mode: 'insensitive',
            },
          })),
        },
      };
    }
  }

  if (filters.habitaciones && filters.habitaciones !== 'Sin ambientes') {
    const minimum = parseMinimum(filters.habitaciones);
    if (minimum !== null) {
      where.habitaciones = { gte: minimum };
    }
  } else if (filters.habitaciones === 'Sin ambientes') {
    where.habitaciones = 0;
  }

  if (filters.banos) {
    const minimum = parseMinimum(filters.banos);
    if (minimum !== null) {
      where.banos = { gte: minimum };
    }
  }

  if (filters.piscina) {
    const wantsPool = normalizeText(filters.piscina) === 'si';
    where.PublicacionCaracteristica = wantsPool
      ? {
          some: {
            Caracteristica: {
              nombre_caracteristica: {
                equals: 'Piscina',
                mode: 'insensitive',
              },
            },
          },
        }
      : {
          none: {
            Caracteristica: {
              nombre_caracteristica: {
                equals: 'Piscina',
                mode: 'insensitive',
              },
            },
          },
        };
  }

  if (filters.ubicacion?.trim()) {
    const search = filters.ubicacion.trim();
    where.OR = [
      {
        Ubicacion: {
          is: {
            direccion: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      },
      {
        Ubicacion: {
          is: {
            zona: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      },
      {
        Ubicacion: {
          is: {
            Ciudad: {
              is: {
                nombre_ciudad: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      },
      {
        Ubicacion: {
          is: {
            Pais: {
              is: {
                nombre_pais: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      },
    ];
  }

  return where;
}

function convertPublicationPriceToUsd(publication: PublicationWithRelations): number | null {
  const rawPrice = toNumber(publication.precio);
  if (rawPrice === null) {
    return null;
  }

  const currencyName = normalizeText(publication.Moneda?.nombre ?? 'USD');

  if (currencyName === 'usd' || currencyName.includes('dolar')) {
    return rawPrice;
  }

  if (currencyName === 'bs' || currencyName.includes('boliv')) {
    const exchangeRate = toNumber(publication.Moneda?.tasa_cambio);
    if (exchangeRate && exchangeRate > 0) {
      return rawPrice / exchangeRate;
    }

    return convertBsToUsd(rawPrice);
  }

  return rawPrice;
}

function passesPriceFilter(
  publication: PublicationWithRelations,
  filters: SearchFiltersInput,
): boolean {
  if (filters.minPrice === undefined && filters.maxPrice === undefined) {
    return true;
  }

  const publicationPriceInUsd = convertPublicationPriceToUsd(publication);
  if (publicationPriceInUsd === null) {
    return false;
  }

  const minPriceInUsd =
    filters.minPrice === undefined
      ? undefined
      : filters.currency === 'BS'
        ? convertBsToUsd(filters.minPrice)
        : filters.minPrice;

  const maxPriceInUsd =
    filters.maxPrice === undefined
      ? undefined
      : filters.currency === 'BS'
        ? convertBsToUsd(filters.maxPrice)
        : filters.maxPrice;

  if (minPriceInUsd !== undefined && publicationPriceInUsd < minPriceInUsd) {
    return false;
  }

  if (maxPriceInUsd !== undefined && publicationPriceInUsd > maxPriceInUsd) {
    return false;
  }

  return true;
}

function mapPublication(publication: PublicationWithRelations): SearchPublicationResult {
  return {
    id_publicacion: publication.id_publicacion,
    titulo: publication.titulo,
    descripcion: publication.descripcion,
    precio: toNumber(publication.precio),
    superficie: toNumber(publication.superficie),
    habitaciones: publication.habitaciones,
    banos: publication.banos,
    garajes: publication.garajes,
    plantas: publication.plantas,
    tipo_inmueble: publication.TipoInmueble?.nombre_inmueble ?? null,
    tipo_operacion: publication.TipoOperacion?.nombre_operacion ?? null,
    estado_construccion: publication.EstadoConstruccion?.nombre_estado_construccion ?? null,
    estado_publicacion: publication.EstadoPublicacion?.nombre_estado ?? null,
    moneda_nombre: publication.Moneda?.nombre ?? null,
    moneda_simbolo: publication.Moneda?.simbolo ?? null,
    moneda_tasa_cambio: toNumber(publication.Moneda?.tasa_cambio),
    ubicacion: publication.Ubicacion
      ? {
          direccion: publication.Ubicacion.direccion,
          zona: publication.Ubicacion.zona,
          ciudad: publication.Ubicacion.Ciudad?.nombre_ciudad ?? null,
          pais: publication.Ubicacion.Pais?.nombre_pais ?? null,
          latitud: toNumber(publication.Ubicacion.latitud),
          longitud: toNumber(publication.Ubicacion.longitud),
        }
      : null,
    imagenes: publication.Imagen.map((image) => image.url_imagen).filter(
      (url): url is string => Boolean(url),
    ),
    caracteristicas: publication.PublicacionCaracteristica.map(
      (item) => item.Caracteristica?.nombre_caracteristica,
    ).filter((name): name is string => Boolean(name)),
  };
}

export async function searchPublicaciones(
  filters: SearchFiltersInput,
): Promise<SearchPublicationResult[]> {
  const publications = await prisma.publicacion.findMany({
    where: buildWhere(filters),
    orderBy: {
      id_publicacion: 'desc',
    },
    include: {
      TipoInmueble: true,
      TipoOperacion: true,
      EstadoConstruccion: true,
      EstadoPublicacion: true,
      Moneda: true,
      Ubicacion: {
        include: {
          Ciudad: true,
          Pais: true,
        },
      },
      Imagen: {
        orderBy: {
          id_imagen: 'asc',
        },
      },
      PublicacionCaracteristica: {
        include: {
          Caracteristica: true,
        },
      },
    },
  });

  const priceFiltered = publications.filter((publication) =>
    passesPriceFilter(publication, filters),
  );

  return priceFiltered.map(mapPublication);
}