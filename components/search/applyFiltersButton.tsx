'use client';
import { Button} from "@/components/ui/button";
interface ApplyFiltersButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export function ApplyFiltersButton({
  isLoading,
  onClick,
}: ApplyFiltersButtonProps) {
  return (
    
    <Button
      type="button"
      variant="default"
      onClick={onClick}
      disabled={isLoading}
      className="px-12 py-6 w-full text-base"
    >
      {isLoading ? 'Buscando...' : 'Aplicar filtros'}
    </Button>
  );
}
