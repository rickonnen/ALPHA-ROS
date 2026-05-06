import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

interface Props {
  precio: number;
  generandoQr: boolean;
  qrUrl: string | null;
  archivoSeleccionado: File | null;
  tienePagoPendiente: boolean;
  estaCargandoEstado: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onVerificar: () => void;
  onDescargar: () => void;
  onSeleccionarArchivo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuitarArchivo: () => void;
  onVerFoto: () => void;
}

export const AccionesPago = ({
  precio, generandoQr, qrUrl, archivoSeleccionado, tienePagoPendiente,
  estaCargandoEstado, fileInputRef, onVerificar, onDescargar,
  onSeleccionarArchivo, onQuitarArchivo, onVerFoto
}: Props) => {
  return (
    <div className="flex w-full flex-col items-center justify-center p-10 md:w-1/2 lg:p-16">
      <div className="flex flex-col items-center w-full max-w-sm">
        <h2 className="text-2xl font-medium text-muted-foreground mb-2">Total a pagar</h2>
        <div className="text-3xl mb-10 text-foreground font-semibold">
          $ {Number(precio).toLocaleString("es-ES")}
        </div>

        {/* Contenedor del QR */}
        <div className="mb-10 flex h-80 w-80 items-center justify-center rounded-md border border-border shadow-sm bg-white p-6">
          {generandoQr ? (
            <Skeleton className="h-[300px] w-[300px]" />
          ) : qrUrl ? (
            <img src={qrUrl} alt="QR" className="h-[300px] w-[300px] block object-contain" />
          ) : (
            <span className="text-sm uppercase text-muted-foreground">Error al cargar QR</span>
          )}
        </div>

        <div className="flex w-full flex-col gap-4">
          <Button 
            size="lg" 
            disabled={!archivoSeleccionado && !tienePagoPendiente} 
            className="w-full font-semibold text-lg py-6 shadow-md cursor-pointer hover:bg-primary/80" 
            onClick={onVerificar}
          >
            Verificar Pago
          </Button>

          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full font-bold text-lg py-6 shadow-md cursor-pointer" 
            onClick={onDescargar}
          >
            DESCARGAR QR
          </Button>

          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={onSeleccionarArchivo} 
          />
          
          {!archivoSeleccionado ? (
            <Button 
              variant="outline" 
              className="w-full font-medium text-lg py-6 cursor-pointer border-dashed border-2" 
              onClick={() => fileInputRef.current?.click()}
            >
              Adjuntar comprobante
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-dashed border-gray-400">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button 
                    type="button"
                    onClick={onVerFoto} // Para abrir el modal de previsualización
                    className="text-sm font-medium truncate text-foreground hover:underline cursor-pointer"
                    >
                    {archivoSeleccionado.name}
                    </button>
                </div>
                
                <button
                    type="button"
                    onClick={onQuitarArchivo} // Debe llamar a la función de limpieza total de arriba
                    className="ml-4 p-2 hover:bg-red-100 rounded-full transition-all group cursor-pointer"
                    >
                    <X 
                        size={28} 
                        strokeWidth={3} 
                        className="text-red-500 group-hover:text-red-700 transition-colors" 
                    />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};