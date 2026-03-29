import { useState, useCallback } from 'react';

export interface FilterState {
  ubicacion: string;
  tipoOperacion: 'En venta' | 'Alquiler' | 'Anticrético' | '';
  tipoInmueble: string[];
  precioMin: string;
  precioMax: string;
  moneda: 'USD' | 'BS';
  habitaciones: string;
  banos: string;
  piscina: 'Sí' | 'No' | '';
}

const INITIAL_FILTERS: FilterState = {
  ubicacion: '',
  tipoOperacion: '',
  tipoInmueble: [],
  precioMin: '',
  precioMax: '',
  moneda: 'USD',
  habitaciones: '',
  banos: '',
  piscina: '',
};

export function useFilters() {
  // Estado temporal (antes de presionar "Aplicar")
  const [pendingFilters, setPendingFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Estado aplicado (lo que realmente filtra los resultados)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Determina si hay algún filtro activo (para habilitar/deshabilitar "Limpiar filtros")
  const hasActiveFilters = useCallback((filters: FilterState): boolean => {
    return (
      filters.ubicacion !== '' ||
      filters.tipoOperacion !== '' ||
      filters.tipoInmueble.length > 0 ||
      filters.precioMin !== '' ||
      filters.precioMax !== '' ||
      filters.habitaciones !== '' ||
      filters.banos !== '' ||
      filters.piscina !== ''
      // Nota: la moneda no cuenta como filtro activo según la HU de limpiar filtros
    );
  }, []);

  // Actualiza un campo individual de los filtros pendientes (sin ejecutar búsqueda)
  const updatePendingFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setPendingFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Aplica los filtros pendientes (equivale a presionar "Aplicar")
  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...pendingFilters });
  }, [pendingFilters]);

  // Limpia SOLO el estado visual del frontend (primer sprint según alcance de la HU)
  // Restablece la moneda al valor por defecto (USD) según criterio 7 de la HU
  const clearFilters = useCallback(() => {
    const reset: FilterState = { ...INITIAL_FILTERS, moneda: 'USD' };
    setPendingFilters(reset);
    // Nota: en el primer sprint NO se actualiza appliedFilters ni se llama al backend.
    // El grid sigue mostrando los resultados que el usuario había filtrado previamente.
    // En el siguiente sprint se llamará al backend para mostrar "destacados".
  }, []);

  return {
    pendingFilters,
    appliedFilters,
    hasActiveFilters: hasActiveFilters(pendingFilters),
    updatePendingFilter,
    applyFilters,
    clearFilters,
  };
}