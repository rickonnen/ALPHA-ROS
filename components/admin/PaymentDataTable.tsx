import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PaymentRecord } from "./paymentTypes"
import { PaymentAcceptModal } from "./PaymentAcceptModal"
import { PaymentRejectModal } from "./PaymentRejectModal"

// Importación de Shadcn Pagination
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaymentDataTableProps {
  arrData: PaymentRecord[];
  bolShowActions?: boolean;
  onPaymentUpdated?: () => void;
  bolIsLoading?: boolean;
  intCurrentPage?: number;
  intTotalPages?: number;
  onPageChange?: (intPage: number) => void;
}

export function PaymentDataTable({ 
  arrData, 
  bolShowActions = false, 
  onPaymentUpdated,
  bolIsLoading = false,
  intCurrentPage = 1,
  intTotalPages = 1,
  onPageChange
}: PaymentDataTableProps) {
  const [bolShowAcceptModal, setBolShowAcceptModal] = useState<boolean>(false);
  const [bolShowRejectModal, setBolShowRejectModal] = useState<boolean>(false);
  const [objSelectedPayment, setObjSelectedPayment] = useState<PaymentRecord | null>(null);
  const [bolIsProcessing, setBolIsProcessing] = useState<boolean>(false);

  const handleOpenAcceptModal = (objPayment: PaymentRecord) => {
    setObjSelectedPayment(objPayment);
    setBolShowAcceptModal(true);
  };

  const handleOpenRejectModal = (objPayment: PaymentRecord) => {
    setObjSelectedPayment(objPayment);
    setBolShowRejectModal(true);
  };

  const handleConfirmAcceptance = async () => {
    if (!objSelectedPayment || bolIsProcessing) return;
    setBolIsProcessing(true);
    try {
      const objResponse = await fetch('/backend/cobros/verificacion-pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: objSelectedPayment.intId,
          status: 'Aceptado'
        }),
      });

      if (objResponse.ok) {
        setBolShowAcceptModal(false);
        if (onPaymentUpdated) onPaymentUpdated();
      } else {
        alert("Error al aceptar el pago");
      }
    } catch (objError) {
      console.error("Error:", objError);
    } finally {
      setBolIsProcessing(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!objSelectedPayment || bolIsProcessing) return;
    setBolIsProcessing(true);
    try {
      const objResponse = await fetch('/backend/cobros/verificacion-pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: objSelectedPayment.intId,
          status: 'Rechazado'
        }),
      });

      if (objResponse.ok) {
        setBolShowRejectModal(false);
        if (onPaymentUpdated) onPaymentUpdated();
      } else {
        alert("Error al rechazar el pago");
      }
    } catch (objError) {
      console.error("Error:", objError);
    } finally {
      setBolIsProcessing(false);
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`} className="border-b border-border">
        <TableCell className="px-6 py-4 border-r border-border">
          <div className="h-4 w-6 bg-muted animate-pulse rounded mx-auto" />
        </TableCell>
        <TableCell className="px-6 py-4 border-r border-border">
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </TableCell>
        <TableCell className="px-6 py-4 border-r border-border">
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        </TableCell>
        <TableCell className="px-6 py-4 border-r border-border">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </TableCell>
        <TableCell className={`px-6 py-4 ${bolShowActions ? 'border-r border-border' : ''}`}>
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </TableCell>
        {bolShowActions && (
          <TableCell className="px-6 py-4">
            <div className="flex justify-center space-x-2">
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
            </div>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div className="w-full rounded-md border border-border overflow-hidden bg-card shadow-sm">
      
      {/* --- INICIO DEL CAMBIO PARA RESPONSIVIDAD --- */}
      <div className="w-full overflow-x-auto">
        {/* min-w-[800px] asegura que las columnas no se aplasten en móviles */}
        <Table className="w-full min-w-[800px]">
          <TableHeader className="bg-muted/30 border-b-2 border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-[60px] border-r border-border">N°</TableHead>
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[25%] border-r border-border">Cliente</TableHead>
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[20%] border-r border-border">Tipo de Plan</TableHead>
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[15%] border-r border-border">Fecha</TableHead>
              <TableHead className={`h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[20%] ${bolShowActions ? 'border-r border-border' : ''}`}>Método de Pago</TableHead>
              {bolShowActions && (
                <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-[180px]">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bolIsLoading ? (
              renderSkeletons()
            ) : arrData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={bolShowActions ? 6 : 5} className="text-center py-16 text-muted-foreground font-medium italic">
                  No existen registros en esta categoría.
                </TableCell>
              </TableRow>
            ) : (
              arrData.map((objPayment) => (
                <TableRow key={objPayment.intId} className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors">
                  <TableCell className="px-6 py-4 font-semibold text-muted-foreground text-center border-r border-border">{objPayment.intId}</TableCell>
                  <TableCell className="px-6 py-4 font-medium text-foreground border-r border-border truncate">{objPayment.strClientName}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground border-r border-border truncate">{objPayment.strPlanType}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground border-r border-border">{objPayment.strDate}</TableCell>
                  <TableCell className={`px-6 py-4 text-muted-foreground truncate ${bolShowActions ? 'border-r border-border' : ''}`}>{objPayment.strPaymentMethod}</TableCell>
                  {bolShowActions && (
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          onClick={() => handleOpenAcceptModal(objPayment)}
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3 font-semibold text-xs transition-transform active:scale-95"
                        >
                          Aceptar
                        </Button>
                        <Button 
                          onClick={() => handleOpenRejectModal(objPayment)}
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3 font-semibold text-xs transition-transform active:scale-95"
                        >
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* --- FIN DEL CAMBIO PARA RESPONSIVIDAD --- */}

      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/50">
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
                  if (intCurrentPage > 1) onPageChange?.(intCurrentPage - 1);
                }}
                className={intCurrentPage === 1 || bolIsLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (intCurrentPage < intTotalPages) onPageChange?.(intCurrentPage + 1);
                }}
                className={intCurrentPage === intTotalPages || bolIsLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {objSelectedPayment && (
        <>
          <PaymentAcceptModal 
            bolIsOpen={bolShowAcceptModal}
            onOpenChange={setBolShowAcceptModal}
            strClientName={objSelectedPayment.strClientName}
            strPlanName={objSelectedPayment.strPlanType}
            onConfirm={handleConfirmAcceptance}
          />
          <PaymentRejectModal 
            bolIsOpen={bolShowRejectModal}
            onOpenChange={setBolShowRejectModal}
            strClientName={objSelectedPayment.strClientName}
            strPlanName={objSelectedPayment.strPlanType}
            onConfirm={handleConfirmRejection}
          />
        </>
      )}
    </div>
  )
}