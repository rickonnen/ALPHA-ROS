type NormalizedPriceFilter = {
  currency: "USD";
  minPrice?: number;
  maxPrice?: number;
};

type PublicationWithPrice = {
  id_publicacion: number;
  titulo: string | null;
  precio: unknown;
  Moneda: {
    id_moneda: number;
    nombre: string | null;
    simbolo: string | null;
    tasa_cambio: unknown;
  } | null;
};

function convertPublicationPriceToUsd(publication: PublicationWithPrice): number | undefined {
  if (publication.precio === null || publication.precio === undefined) {
    return undefined;
  }

  const rawPrice = Number(publication.precio);

  if (Number.isNaN(rawPrice)) {
    return undefined;
  }

  const currencyName = publication.Moneda?.nombre?.toUpperCase();

  if (currencyName === "USD") {
    return rawPrice;
  }

  if (currencyName === "BS") {
    const exchangeRate = Number(publication.Moneda?.tasa_cambio);

    if (!exchangeRate || Number.isNaN(exchangeRate) || exchangeRate <= 0) {
      return undefined;
    }

    return rawPrice / exchangeRate;
  }

  return undefined;
}

export function filterPublicationsByPrice(
  publications: PublicationWithPrice[],
  normalizedFilters: NormalizedPriceFilter
) {
  return publications.filter((publication) => {
    const publicationPriceInUsd = convertPublicationPriceToUsd(publication);

    if (publicationPriceInUsd === undefined) {
      return false;
    }

    if (
      normalizedFilters.minPrice !== undefined &&
      publicationPriceInUsd < normalizedFilters.minPrice
    ) {
      return false;
    }

    if (
      normalizedFilters.maxPrice !== undefined &&
      publicationPriceInUsd > normalizedFilters.maxPrice
    ) {
      return false;
    }

    return true;
  });
}