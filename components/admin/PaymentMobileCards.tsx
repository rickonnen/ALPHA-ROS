import { Button } from "@/components/ui/button"
import { PaymentRecord } from "./paymentTypes"

interface PaymentMobileCardsProps {
  arrData: PaymentRecord[];
  bolIsLoading?: boolean;
  bolShowActions?: boolean;
  onViewReceipt?: (url: string) => void;
  onOpenModal: (obj: PaymentRecord, type: 'accept' | 'reject') => void;
  bolIsProcessing: boolean;
}

export function PaymentMobileCards({ 
  arrData, 
  bolIsLoading, 
  bolShowActions, 
  onViewReceipt, 
  onOpenModal, 
  bolIsProcessing 
}: PaymentMobileCardsProps) {
  return (
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
                    onClick={() => onOpenModal(objPayment, 'accept')}
                    className="flex-1 font-bold active:scale-95 transition-transform"
                    disabled={bolIsProcessing}
                  >
                    Aceptar
                  </Button>
                  {/*El botón es naranja como en la vista escritorio*/}
                  <Button 
                    onClick={() => onOpenModal(objPayment, 'reject')}
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
  )
}