'use client';

interface ApplyFiltersButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export function ApplyFiltersButton({
  isLoading,
  onClick,
}: ApplyFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-72 rounded-md bg-[#1F3A4D] py-2 text-sm text-white transition-colors hover:bg-[#C26E5A] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? 'Buscando...' : 'Aplicar filtros'}
    </button>
  );
}
