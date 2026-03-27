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
import { Check, X } from "lucide-react"
import { PaymentRecord } from "./paymentTypes"
import { PaymentAcceptModal } from "./PaymentAcceptModal"
import { PaymentRejectModal } from "./PaymentRejectModal"

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 24/03/26
 * Funcionalidad: Interfaz que define las propiedades para el componente PaymentDataTable.
 */
interface PaymentDataTableProps {
  arrData: PaymentRecord[];
  bolShowActions?: boolean;
  onPaymentUpdated?: () => void;
}

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 24/03/26
 * Funcionalidad: Muestra una tabla de los registros de pago con acciones opcionales para aceptar o rechazar.
 * @param {array} arrData - Matriz de registros de pago para mostrar.
 * @param {boolean} bolShowActions - Indicador para determinar si se deben mostrar los botones de acción.
 * @param {function} onPaymentUpdated - Función de devolución de llamada ejecutada después de que un pago se actualiza correctamente.
 * @return {object} objJSX - El componente de React renderizado.
 */
export function PaymentDataTable({ arrData, bolShowActions = false, onPaymentUpdated }: PaymentDataTableProps) {
  const [bolShowAcceptModal, setBolShowAcceptModal] = useState<boolean>(false);
  const [bolShowRejectModal, setBolShowRejectModal] = useState<boolean>(false);
  const [objSelectedPayment, setObjSelectedPayment] = useState<PaymentRecord | null>(null);

  const handleOpenAcceptModal = (objPayment: PaymentRecord) => {
    setObjSelectedPayment(objPayment);
    setBolShowAcceptModal(true);
  };

  const handleOpenRejectModal = (objPayment: PaymentRecord) => {
    setObjSelectedPayment(objPayment);
    setBolShowRejectModal(true);
  };

  // Lógica conectada al backend para aceptar el pago
  const handleConfirmAcceptance = async () => {
    if (!objSelectedPayment) return;
    
    try {
      const objResponse = await fetch('/backend/cobros', {
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
      alert("Error de conexión");
    }
  };

  // Lógica conectada al backend para rechazar el pago
  const handleConfirmRejection = async () => {
    if (!objSelectedPayment) return;

    try {
      const objResponse = await fetch('/backend/cobros', {
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
      alert("Error de conexión");
    }
  };

  return (
    // Se usa bg-background y border-border en lugar de colores hex
    <div className="w-full rounded-md border border-border overflow-hidden bg-white">
      <Table className="table-fixed w-full">
        {/* Se usa bg-muted en lugar de un hex hardcoded para el encabezado */}
        <TableHeader className="bg-background border-b-2 border-border">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-12 px-6 text-xs font-bold tracking-wider text-muted-foreground uppercase text-center w-[20px] border-r border-border">N°</TableHead>
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
          {arrData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={bolShowActions ? 6 : 5} className="text-center py-16 text-muted-foreground font-medium">No existen registros.</TableCell>
            </TableRow>
          ) : (
            arrData.map((objPayment) => (
              // Se usa hover:bg-muted/50 en lugar del hover con hex
              <TableRow key={objPayment.intId} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                <TableCell className="px-6 py-4 font-semibold text-muted-foreground text-center border-r border-border">{objPayment.intId}</TableCell>
                <TableCell className="px-6 py-4 font-medium text-foreground border-r border-border truncate">{objPayment.strClientName}</TableCell>
                <TableCell className="px-6 py-4 text-muted-foreground border-r border-border truncate">{objPayment.strPlanType}</TableCell>
                <TableCell className="px-6 py-4 text-muted-foreground border-r border-border">{objPayment.strDate}</TableCell>
                <TableCell className={`px-6 py-4 text-muted-foreground truncate ${bolShowActions ? 'border-r border-border' : ''}`}>{objPayment.strPaymentMethod}</TableCell>
                {bolShowActions && (
                  <TableCell className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      {/* Botón Aceptar: Usa primary y su foreground */}
                      <Button 
                        onClick={() => handleOpenAcceptModal(objPayment)}
                        variant="default" 
                        size="sm" 
                        className="h-8 px-3 flex items-center gap-1.5"
                      >
                        <span className="text-xs font-semibold">Aceptar</span>
                      </Button>
                      
                      {/* Botón Rechazar: Usa destructive para el rechazo */}
                      <Button 
                        onClick={() => handleOpenRejectModal(objPayment)}
                        variant="default" 
                        size="sm" 
                        className="h-8 px-3 flex items-center gap-1.5"
                      >
                        <span className="text-xs font-semibold">Rechazar</span>
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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