import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

/**
 * Dev: Nicole Belen Arias Murillo
 * Funcionalidad: Modal para previsualizar la imagen del comprobante de pago.
 */
interface PaymentEvidenceModalProps {
  bolIsOpen: boolean;
  onOpenChange: (bolOpen: boolean) => void;
  strUrl: string | null;
}

export function PaymentEvidenceModal({
  bolIsOpen,
  onOpenChange,
  strUrl
}: PaymentEvidenceModalProps) {
  return (
    <Dialog open={bolIsOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] w-[95%] p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Comprobante de Pago</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-col items-center">
          {/* Cabecera del Modal */}
          <div className="w-full py-4 border-b border-border bg-gray-50/50">
            <h3 className="text-center font-bold text-lg text-foreground uppercase tracking-tight">
              Comprobante de Pago
            </h3>
          </div>

          {/* Área de la Imagen */}
          <div className="w-full p-6 flex justify-center bg-white min-h-[300px]">
            {strUrl ? (
              <img 
                src={strUrl} 
                alt="Comprobante de transferencia" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm border border-border"
              />
            ) : (
              <div className="flex items-center justify-center text-muted-foreground italic">
                No se pudo cargar la imagen del comprobante.
              </div>
            )}
          </div>
            {/*Falta corregir en el botón "volver" o cambiar a la genérica x del modal por defecto... spolier quizás me quede con la x */}
          {/* Botón Volver*/}
          <div className="w-1 p-3 flex justify-center border-t bg-gray-50/50">
            <Button
              onClick={() => onOpenChange(false)}
              variant="default"
              className="hover:bg-[#444] flex-1 font-bold px-12 py-6 active:scale-95 transition-transform">
              Volver
            </Button>
          </div> 
        </div>
      </DialogContent>
    </Dialog>
  )
}