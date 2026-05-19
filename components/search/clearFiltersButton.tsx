import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClearFiltersButtonProps {
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onClear: () => void;
}

export function ClearFiltersButton({
  hasActiveFilters,
  activeFiltersCount,
  onClear,
}: ClearFiltersButtonProps) {
  return (
    <Button
      type="button"
      variant={hasActiveFilters ? "secondary" : "outline"}
      size="default"
      disabled={!hasActiveFilters}
      onClick={onClear}
      aria-label="Limpiar todos los filtros aplicados"
      className={cn(
        "w-full gap-2",
        !hasActiveFilters && "text-gray-400"
      )}
    >
      <span>
        Limpiar filtros
        {activeFiltersCount > 0 && (
          <span className="ml-1">({activeFiltersCount})</span>
        )}
      </span>
    </Button>
  );
}