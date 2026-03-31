'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClearFiltersButtonProps {
  /** Si hay filtros activos; controla si el botón está habilitado o deshabilitado */
  hasActiveFilters: boolean;
  /** Callback ejecutado al presionar el botón */
  onClear: () => void;
}

export function ClearFiltersButton({ hasActiveFilters, onClear }: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      disabled={!hasActiveFilters}
      onClick={onClear}
      aria-label="Limpiar todos los filtros aplicados"
      className={cn(
        // Base
        'inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none',
        // Estado activo
        hasActiveFilters
          ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 cursor-pointer'
          : 'border-gray-200 bg-white text-gray-300  cursor-not-allowed pointer-events-none',
      )}
    >
      <X className="size-3.5 shrink-0" />
      Limpiar filtros
    </button>
  );
}