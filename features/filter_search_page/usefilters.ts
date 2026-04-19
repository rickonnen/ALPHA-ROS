import { useCallback, useMemo } from 'react';

type Currency = 'USD' | 'BS';

type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
};

interface UseFiltersProps {
  appliedPriceFilter: AppliedPriceFilter | null;
  selectedCurrency: Currency;
  onClearPriceFilter: () => void;
  onResetCurrency: () => void;
}

export function useFilters({
  appliedPriceFilter,
  selectedCurrency,
  onClearPriceFilter,
  onResetCurrency,
}: UseFiltersProps) {
  // Detecta si hay algún filtro activo basándose en los estados reales de la página.
  // La moneda NO cuenta como filtro activo (criterio 7 HU #9: se resetea pero no habilita el botón).
  const hasActiveFilters = useMemo(() => {
    return appliedPriceFilter !== null &&
      (appliedPriceFilter.minPrice !== undefined || appliedPriceFilter.maxPrice !== undefined);
  }, [appliedPriceFilter]);

  // Limpia todos los filtros del frontend (primer sprint — sin llamada al backend).
  // Restablece la moneda a USD (criterio 7 de la HU #9).
  const clearFilters = useCallback(() => {
    onClearPriceFilter();
    onResetCurrency();
  }, [onClearPriceFilter, onResetCurrency]);

  return {
    hasActiveFilters,
    clearFilters,
  };
}