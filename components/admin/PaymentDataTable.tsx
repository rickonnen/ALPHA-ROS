"use client"

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaymentDataTableProps {
  arrData: PaymentRecord[];
  bolShowActions?: boolean;
  onPaymentUpdated?: () => void;
  bolIsLoading?: boolean;
  intCurrentPage?: number;
  intTotalPages?: number;
  onPageChange?: (intPage: number) => void;
}
const TableSkeleton = ({ bolShowActions }: { bolShowActions: boolean }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`} className="border-b border-border">
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
    ))}
  </>
);

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

  const handleOpenModal = (objPayment: PaymentRecord, type: 'accept' | 'reject') => {
    setObjSelectedPayment(objPayment);
    if (type === 'accept') setBolShowAcceptModal(true);
    else setBolShowRejectModal(true);
  };

  const updatePaymentStatus = async (strNewStatus: 'Aceptado' | 'Rechazado') => {
    if (!objSelectedPayment || bolIsProcessing) return;
    
    setBolIsProcessing(true);
    try {
      const objResponse = await fetch('/api/cobros/verificacion-pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: objSelectedPayment.intId,
          status: strNewStatus
        }),
      });

      if (objResponse.ok) {
        setBolShowAcceptModal(false);
        setBolShowRejectModal(false);
        if (onPaymentUpdated) onPaymentUpdated();
      } else {
        alert(`Error al intentar marcar el pago como ${strNewStatus.toLowerCase()}`);
      }
    } catch (objError) {
      console.error("Error de conexión:", objError);
      alert("Error de red. Por favor, revisa tu conexión.");
    } finally {
      setBolIsProcessing(false);
    }
  };

  return (
    <div className="w-full rounded-md border border-border overflow-hidden bg-card shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader className="bg-muted/30 border-b-2 border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-16 border-r border-border">N°</TableHead>
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[25%] border-r border-border">Cliente</TableHead>
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[20%] border-r border-border">Tipo de Plan</TableHead>
              <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[15%] border-r border-border">Fecha</TableHead>
              <TableHead className={`h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[20%] ${bolShowActions ? 'border-r border-border' : ''}`}>Método de Pago</TableHead>
              {bolShowActions && (
                <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-48">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bolIsLoading ? (
              <TableSkeleton bolShowActions={bolShowActions} />
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
                  <TableCell className="px-6 py-4 font-medium text-foreground border-r border-border truncate max-w-[250px]">{objPayment.strClientName}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground border-r border-border truncate max-w-[200px]">{objPayment.strPlanType}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground border-r border-border">{objPayment.strDate}</TableCell>
                  <TableCell className={`px-6 py-4 text-muted-foreground truncate max-w-[200px] ${bolShowActions ? 'border-r border-border' : ''}`}>{objPayment.strPaymentMethod}</TableCell>
                  {bolShowActions && (
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          onClick={() => handleOpenModal(objPayment, 'accept')}
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3 font-semibold text-xs transition-transform active:scale-95"
                          disabled={bolIsProcessing}
                        >
                          Aceptar
                        </Button>
                        <Button 
                          onClick={() => handleOpenModal(objPayment, 'reject')}
                          variant="default" 
                          size="sm" 
                          className="h-8 px-3 font-semibold text-xs transition-transform active:scale-95"
                          disabled={bolIsProcessing}
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

      {objSelectedPayment && (
        <>
          <PaymentAcceptModal 
            bolIsOpen={bolShowAcceptModal}
            onOpenChange={setBolShowAcceptModal}
            strClientName={objSelectedPayment.strClientName}
            strPlanName={objSelectedPayment.strPlanType}
            onConfirm={() => updatePaymentStatus('Aceptado')}
          />
          <PaymentRejectModal 
            bolIsOpen={bolShowRejectModal}
            onOpenChange={setBolShowRejectModal}
            strClientName={objSelectedPayment.strClientName}
            strPlanName={objSelectedPayment.strPlanType}
            onConfirm={() => updatePaymentStatus('Rechazado')}
          />
        </>
      )}
    </div>
  )
}