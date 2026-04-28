// components/admin/payments/PaymentPagination.tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaymentPaginationProps {
  intCurrentPage: number;
  intTotalPages: number;
  bolIsLoading?: boolean;
  onPageChange?: (intPage: number) => void;
}

export function PaymentPagination({
  intCurrentPage,
  intTotalPages,
  bolIsLoading,
  onPageChange
}: PaymentPaginationProps) {
  // Si no hay páginas, no renderizamos la paginación
  if (intTotalPages <= 0) return null;

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border border-border md:border-t-0 rounded-b-md md:rounded-b-md bg-card/50 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Página <span className="font-bold text-foreground">{intCurrentPage}</span> de <span className="font-bold text-foreground">{intTotalPages}</span>
      </p>
      
      <Pagination className="justify-end w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (intCurrentPage > 1 && !bolIsLoading) onPageChange?.(intCurrentPage - 1);
              }}
              className={intCurrentPage === 1 || bolIsLoading ? "pointer-events-none opacity-50" : "cursor-pointer transition-colors hover:bg-muted"}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (intCurrentPage < intTotalPages && !bolIsLoading) onPageChange?.(intCurrentPage + 1);
              }}
              className={intCurrentPage === intTotalPages || bolIsLoading ? "pointer-events-none opacity-50" : "cursor-pointer transition-colors hover:bg-muted"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}