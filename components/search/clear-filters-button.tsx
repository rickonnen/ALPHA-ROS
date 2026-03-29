'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ClearFiltersButtonProps {
  /** Si hay filtros activos; controla si el botón está habilitado o deshabilitado */
  hasActiveFilters: boolean;
  /** Callback ejecutado al presionar el botón */
  onClear: () => void;
}

export function ClearFiltersButton({ hasActiveFilters, onClear }: ClearFiltersButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!hasActiveFilters}
      onClick={onClear}
      className="w-full gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive hover:border-destructive/40 disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Limpiar todos los filtros aplicados"
    >
      <X className="size-3.5 shrink-0" />
      Limpiar filtros
    </Button>
  );
}
