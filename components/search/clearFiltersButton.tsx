import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClearFiltersButtonProps {
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function ClearFiltersButton({
  hasActiveFilters,
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
        "w-full",
        !hasActiveFilters && "text-gray-400"
      )}
    >
      Limpiar filtros
    </Button>
  );
}