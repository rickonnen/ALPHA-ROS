import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

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
  onConfirm: () => void;
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
  return (
    <AlertDialog open={bolIsOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[500px] bg-[#F3F3F3] rounded-2xl p-8 border-none shadow-md">
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
        {/* Texto descriptivo con el mismo formato y espaciado */}
        <p className="text-center text-gray-700 text-sm mb-8">
          Deseas rechazar el pago del cliente correspondiente:{" "}
          <span className="font-semibold">{strClientName}</span>{" "}
          para el plan <span className="font-semibold">{strPlanName}</span>
        </p>
        {/* Botones de acción con estilo simétrico para cancelar o rechazar */}
        <div className="flex justify-between px-6">
          <AlertDialogCancel className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-xl text-sm font-semibold capitalize border-none">
            cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-xl text-sm font-semibold capitalize border-none"
          >
            rechazar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}