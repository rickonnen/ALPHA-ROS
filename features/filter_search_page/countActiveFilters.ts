type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
} | null;

type AdvancedFilterValues = {
  habitaciones?: string;
  banos?: string;
  piscina?: string;
  minSurface?: number;
  maxSurface?: number;
};

type CountActiveFiltersParams = {
  searchLocation: string;
  selectedOperation: string[];
  selectedPropertyTypes: number[];
  advancedFilterValues: AdvancedFilterValues;
  appliedPriceFilter: AppliedPriceFilter;
};

function isActiveValue(value?: string): boolean {
  if (!value) return false;

  const normalizedValue = value.trim().toLowerCase();

  return ![
    "",
    "todos",
    "todas",
    "cualquiera",
    "ninguno",
    "default",
  ].includes(normalizedValue);
}

export function countActiveFilters({
  searchLocation,
  selectedOperation,
  selectedPropertyTypes,
  advancedFilterValues,
  appliedPriceFilter,
}: CountActiveFiltersParams): number {
  let count = 0;

  if (searchLocation.trim()) count += 1;

  if (selectedOperation.length > 0) {
    count += selectedOperation.length;
  }

  if (selectedPropertyTypes.length > 0) {
    count += selectedPropertyTypes.length;
  }

  if (isActiveValue(advancedFilterValues.habitaciones)) {
    count += 1;
  }

  if (isActiveValue(advancedFilterValues.banos)) {
    count += 1;
  }

  if (isActiveValue(advancedFilterValues.piscina)) {
    count += 1;
  }

  if (
    advancedFilterValues.minSurface !== undefined ||
    advancedFilterValues.maxSurface !== undefined
  ) {
    count += 1;
  }

  if (
    appliedPriceFilter?.minPrice !== undefined ||
    appliedPriceFilter?.maxPrice !== undefined
  ) {
    count += 1;
  }

  return count;
}