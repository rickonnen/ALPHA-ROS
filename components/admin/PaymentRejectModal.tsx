import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useState, useEffect } from "react"

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 24/03/26
 * Funcionalidad: Interfaz que define las propiedades del componente PaymentRejectModal.
 */
interface PaymentRejectModalProps {
  bolIsOpen: boolean;
  onOpenChange: (bolOpen: boolean) => void;
  strClientName: string;
  strPlanName: string;
  onConfirm: (strReason: string) => void;
}

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 24/03/26
 * Funcionalidad: Mostrar un modal de confirmación para rechazar el pago de un cliente con un estilo de maqueta simétrica.
 * @param {boolean} bolIsOpen - Estado que determina si el modal es actualmente visible.
 * @param {function} onOpenChange - Función de retorno de llamada para manejar los cambios de visibilidad del modal.
 * @param {string} strClientName - Nombre del cliente cuyo pago está siendo rechazado.
 * @param {string} strPlanName - Nombre del plan asociado con el pago.
 * @param {function} onConfirm - Función de retorno ejecutada cuando el usuario confirma el rechazo.
 * @return {object} objJSX - El componente modal de React renderizado.
 */
export function PaymentRejectModal({
  bolIsOpen,
  onOpenChange,
  strClientName,
  strPlanName,
  onConfirm
}: PaymentRejectModalProps) {
  const [strReason, setStrReason] = useState<string>("");

  useEffect(() => {
    if (!bolIsOpen) {
      setStrReason("");
    }
  }, [bolIsOpen]);
  
  const handleConfirm = (e: React.MouseEvent) => {
    if (!strReason) {
      e.preventDefault(); 
      return;
    }
    onConfirm(strReason);
  };

  return (
    <AlertDialog open={bolIsOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] max-w-[500px] bg-[#F3F3F3] rounded-2xl p-6 sm:p-8 border-none shadow-md">
        {/* Título accesible oculto visualmente */}
        <VisuallyHidden>
          <AlertDialogTitle>
            Rechazo de pago
          </AlertDialogTitle>
        </VisuallyHidden>
        {/* Icono */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#FCA5A5] p-3 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <p className="text-center text-gray-700 text-sm sm:text-base mb-8">
          Deseas rechazar el pago del cliente correspondiente:{" "}
          <span className="font-semibold">{strClientName}</span>{" "}
          para el plan <span className="font-semibold">{strPlanName}</span>
        </p>

        {/* seleccionar motivo ª */}
        <div className="mb-8 flex flex-col gap-2">
          <label htmlFor="reason-select" className="text-sm font-bold text-gray-700">
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <select 
            id="reason-select"
            value={strReason}
            onChange={(e) => setStrReason(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 outline-none"
          >
            <option value="" disabled>Seleccione un motivo...</option>
            <option value="Comprobante inválido">Comprobante inválido</option>
            <option value="Monto incorrecto">Monto incorrecto</option>
            <option value="Datos no coinciden">Datos no coinciden</option>
          </select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-between gap-3 sm:px-6">
          <AlertDialogCancel className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-black px-6 py-2.5 sm:py-2 rounded-xl text-sm font-semibold capitalize border-none mt-0">
            cancelar
          </AlertDialogCancel>
          {/* Bloqueado si está vacío */}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!strReason}
            className={`w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl text-sm font-semibold capitalize border-none transition-all ${
              strReason 
                ? "bg-gray-300 hover:bg-gray-400 text-black" // Activo
                : "bg-gray-200 text-gray-400 cursor-not-allowed" // Desactivado
            }`}
          >
            aceptar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}