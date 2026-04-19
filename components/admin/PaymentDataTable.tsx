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
  onViewReceipt?: (strUrl: string) => void;
  strStatus?: 'Pendiente' | 'Aceptado' | 'Rechazado';
}

const TableSkeleton = ({ strStatus }: { strStatus: string }) => {

  const intTotalCells = strStatus === 'Aceptado' ? 5 : 6;

  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="border-b border-border">
          
          {Array.from({ length: intTotalCells }).map((_, idx) => (
            <TableCell 
              key={`cell-${idx}`} 
              className={`px-6 py-4 ${idx < intTotalCells - 1 ? 'border-r border-border' : ''}`}
            >
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export function PaymentDataTable({ 
  arrData, 
  bolShowActions = false, 
  onPaymentUpdated,
  bolIsLoading = false,
  intCurrentPage = 1,
  intTotalPages = 1,
  onPageChange,
  onViewReceipt,
  strStatus = 'Pendiente'
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

  const updatePaymentStatus = async (strNewStatus: 'Aceptado' | 'Rechazado', strReason?: string) => {
    if (!objSelectedPayment || bolIsProcessing) return;
    
    setBolIsProcessing(true);
    try {
      const objResponse = await fetch('/api/cobros/verificacion-pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: objSelectedPayment.intId,
          status: strNewStatus,
          reason: strReason || null
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
    <div className="w-full bg-transparent">

      <div className="md:hidden grid grid-cols-1 gap-4 mb-4">
        {bolIsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`card-skeleton-${i}`} className="bg-card border border-border rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </div>
              {bolShowActions && <div className="h-10 w-full bg-muted rounded mt-4"></div>}
            </div>
          ))
        ) : arrData.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground font-medium italic bg-card rounded-lg border border-border">
            No existen registros en esta categoría.
          </div>
        ) : (
          arrData.map((objPayment) => (
            <div key={objPayment.intId} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-bold text-foreground text-lg">#{objPayment.intId}</span>
                {/*Se movio el "ver detalles" de "método" a "#" (cosas de wireframe); se cambio la estética*/}
                {objPayment.strReceiptUrl && (
                  <div className="flex gap-0 mt-0 pt-0">
                    <button
                          onClick={() => onViewReceipt && onViewReceipt(objPayment.strReceiptUrl!)}
                          className="bg-[#1F3A4D] hover:bg-[#374151] text-white font-bold px-6 sm:px-2 rounded-lg py-1.5 sm:py-2"
                          disabled={bolIsProcessing}
                        >
                          Ver Comprobante
                        </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Cliente:</span>
                  <span className="font-semibold text-right text-foreground max-w-[60%] truncate">{objPayment.strClientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Plan:</span>
                  <span className="text-right truncate">{objPayment.strPlanType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Fecha:</span>
                  <span className="text-right truncate">{objPayment.strDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Método:</span>
                  <div className="flex flex-col items-end">
                    <span className="text-right truncate">{objPayment.strPaymentMethod}</span>
                  </div>
                </div>
              </div>
              {/*Se separo "razón de rachazo" de "Método"*/}
              {objPayment.strReason && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Razón de Rechazo:</span>
                  <span className="text-right truncate">{objPayment.strReason}</span>
                </div>
              )}

              {bolShowActions && (
                <div className="flex gap-3 mt-2 pt-3 border-t border-border/50">
                  <Button 
                    onClick={() => handleOpenModal(objPayment, 'accept')}
                    className="flex-1 font-bold active:scale-95 transition-transform"
                    disabled={bolIsProcessing}
                  >
                    Aceptar
                  </Button>
                  {/*El botón es naranja como en la vista escritorio*/}
                  <Button 
                    onClick={() => handleOpenModal(objPayment, 'reject')}
                    className="flex-1 font-bold text-xm bg-secondary text-secondary-foreground hover:bg-secondary text-white transition-transform"
                    disabled={bolIsProcessing}
                  >
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="hidden md:block w-full rounded-t-md border border-border border-b-0 overflow-hidden bg-card shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader className="bg-muted/30 border-b-2 border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-16 border-r border-border">N°</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[25%] border-r border-border">Cliente</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[20%] border-r border-border">Tipo de Plan</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[15%] border-r border-border">Fecha</TableHead>
                <TableHead className={`h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase w-[20%] ${strStatus !== 'Aceptado' ? 'border-r border-border' : ''}`}>Método de Pago</TableHead>

                {strStatus === 'Pendiente' && (
                  <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-48">
                    Acciones
                  </TableHead>
                )}
                {strStatus === 'Rechazado' && (
                  <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-48">
                    Razón de Rechazo
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bolIsLoading ? (
                <TableSkeleton strStatus={strStatus} /> 
              ) : arrData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={strStatus === 'Aceptado' ? 5 : 6} 
                    className="text-center py-16 text-muted-foreground font-medium italic"
                  >
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
                    <TableCell className={`px-6 py-4 text-muted-foreground truncate max-w-[200px] ${strStatus !== 'Aceptado' ? 'border-r border-border' : ''}`}>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">{objPayment.strPaymentMethod}</span>
                        
                        {/* Se supone que siempre debe haber el comprobante pero... , proximo a modificar */}
                        {objPayment.strReceiptUrl && (
                          <button
                            onClick={() => onViewReceipt && onViewReceipt(objPayment.strReceiptUrl!)}
                            className="text-primary font-bold text-sm text-left underline hover:text-primary/80 transition-colors w-fit cursor-pointer"
                          >
                            ver detalles
                          </button>
                        )}
                      </div>
                    </TableCell>
                    {strStatus === 'Pendiente' && (
                      <TableCell className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          {/*Ahora ya sale el cursor ese de mano/clic al pasar por el botón */}
                          <Button 
                            onClick={() => handleOpenModal(objPayment, 'accept')}
                            variant="default" 
                            size="sm" 
                            className="h-8 px-3 font-semibold text-xs transition-transform active:scale-95 hover:bg-gray-400+- text-white transition-colors cursor-pointer mt-1"
                            disabled={bolIsProcessing}
                          >
                            Aceptar
                          </Button>
                          {/*Ahora es naranja... el botón de rechazar */}
                          <Button 
                            onClick={() => handleOpenModal(objPayment, 'reject')}
                            variant="default" 
                            size="sm" 
                            className="h-8 px-3 font-semibold text-xs bg-secondary text-secondary-foreground hover:bg-[#a65d4c] text-white transition-colors cursor-pointer mt-1"
                            disabled={bolIsProcessing}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    )}
                    {/* El texto de la columna de rechazo ya no es rojo ª */}
                    {strStatus === 'Rechazado' && (
                      <TableCell className="h-12 px-6 text-center text-xs font-bold tracking-wider text-muted-foreground w-[20%] border-r border-border">
                        <span className="text-sm font-medium active:scale-95">
                          {objPayment.strReason || "-"}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
            onConfirm={(strReason) => updatePaymentStatus('Rechazado', strReason)}
          />
        </>
      )}
    </div>
  )
}