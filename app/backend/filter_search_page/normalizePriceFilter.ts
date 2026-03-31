import { convertBsToUsd } from "./currencyConverter";

type PriceFilterData = {
  currency: string;
  minPrice?: number;
  maxPrice?: number;
};

type NormalizedPriceFilter = {
  currency: "USD";
  minPrice?: number;
  maxPrice?: number;
};

export function normalizePriceFilterToUsd(
  filters: PriceFilterData
): NormalizedPriceFilter {
  const minPriceInUsd =
    filters.minPrice === undefined
      ? undefined
      : filters.currency === "BS"
      ? convertBsToUsd(filters.minPrice)
      : filters.minPrice;

  const maxPriceInUsd =
    filters.maxPrice === undefined
      ? undefined
      : filters.currency === "BS"
      ? convertBsToUsd(filters.maxPrice)
      : filters.maxPrice;

  return {
    currency: "USD",
    minPrice: minPriceInUsd,
    maxPrice: maxPriceInUsd,
  };
}