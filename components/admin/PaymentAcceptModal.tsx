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
 * Funcionalidad: Interfaz que define las propiedades para el componente PaymentAcceptModal.
 */
interface PaymentAcceptModalProps {
  bolIsOpen: boolean;
  onOpenChange: (bolOpen: boolean) => void;
  strClientName: string;
  strPlanName: string;
  onConfirm: () => void;
}

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 24/03/26
 * Funcionalidad: Mostrar un modal de confirmación para aceptar el pago de un cliente con estilo de maqueta.
 * @param {boolean} bolIsOpen - Estado que determina si el modal es actualmente visible.
 * @param {function} onOpenChange - Función de retorno de llamada para manejar los cambios de visibilidad del modal.
 * @param {string} strClientName - Nombre del cliente cuyo pago está siendo aceptado.
 * @param {string} strPlanName - Nombre del plan asociado con el pago.
 * @param {function} onConfirm - Función de retorno ejecutada cuando el usuario confirma la aceptación.
 * @return {object} objJSX - El componente modal de React renderizado.
 */
export function PaymentAcceptModal({
  bolIsOpen,
  onOpenChange,
  strClientName,
  strPlanName,
  onConfirm
}: PaymentAcceptModalProps) {
  return (
    <AlertDialog open={bolIsOpen} onOpenChange={onOpenChange}>
      {/* Añadimos márgenes horizontales (mx-4) para que en móviles no toque los bordes y ajustamos el padding (p-6 sm:p-8) */}
      <AlertDialogContent className="w-[90%] max-w-[500px] bg-[#F3F3F3] rounded-2xl p-6 sm:p-8 border-none shadow-md">
        {/* Título accesible oculto visualmente por temas de accesibilidad */}
        <VisuallyHidden>
          <AlertDialogTitle>
            Confirmación de pago
          </AlertDialogTitle>
        </VisuallyHidden>
        
        {/* Icono central de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#FCA5A5] p-3 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {/* Texto descriptivo indicando la acción a confirmar */}
        <p className="text-center text-gray-700 text-sm sm:text-base mb-8">
          Deseas aceptar el pago del cliente correspondiente:{" "}
          <span className="font-semibold">{strClientName}</span>{" "}
          para el plan <span className="font-semibold">{strPlanName}</span>
        </p>
        
        {/* Botones de acción para cancelar o aceptar 
          CAMBIOS: flex-col en móvil, sm:flex-row en desktop. gap-3 para espaciado.
        */}
        <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-between gap-3 sm:px-6">
          <AlertDialogCancel className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-black px-6 py-2.5 sm:py-2 rounded-xl text-sm font-semibold capitalize mt-0">
            cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-black px-6 py-2.5 sm:py-2 rounded-xl text-sm font-semibold capitalize"
          >
            aceptar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}