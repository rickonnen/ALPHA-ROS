import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PaymentRecord } from "./paymentTypes"

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

interface PaymentDesktopTableProps {
  arrData: PaymentRecord[];
  strStatus: string;
  bolIsLoading?: boolean;
  //bolShowActions?: boolean; solo es para las acciones en pendientes
  onViewReceipt?: (url: string) => void;
  onOpenModal: (obj: PaymentRecord, type: 'accept' | 'reject') => void;
  bolIsProcessing: boolean;
}

export function PaymentDesktopTable({ 
  arrData, 
  strStatus, 
  bolIsLoading, 
  //bolShowActions, solo es para las acciones en pendientes
  onViewReceipt, 
  onOpenModal, 
  bolIsProcessing 
}: PaymentDesktopTableProps) {
  return (
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
                            onClick={() => onOpenModal(objPayment, 'accept')}
                            variant="default" 
                            size="sm" 
                            className="h-8 px-3 font-semibold text-xs transition-transform active:scale-95 hover:bg-gray-400 text-white transition-colors cursor-pointer mt-1"
                            disabled={bolIsProcessing}
                          >
                            Aceptar
                          </Button>
                          {/*Ahora es naranja... el botón de rechazar */}
                          <Button 
                            onClick={() => onOpenModal(objPayment, 'reject')}
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
  );
}