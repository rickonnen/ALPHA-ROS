import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DatosCrypto {
  address: string;
  amount: number;
  paymentId: string;
}

interface PagoVirtualProps {
  datosCrypto: DatosCrypto | null;
  cargandoCrypto: boolean;
}

export const PagoVirtual = ({ datosCrypto, cargandoCrypto }: PagoVirtualProps) => {
  const copiarDireccion = () => {
    if (!datosCrypto) return;
    navigator.clipboard.writeText(datosCrypto.address);
    alert("Dirección copiada al portapapeles");
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
      {/* QR Crypto */}
      <div className="mb-6 flex min-h-[400px] w-80 flex-col items-center justify-center rounded-md border border-border shadow-sm bg-white p-6 text-center">
        {cargandoCrypto ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-60 w-60" />
            <p className="text-xs animate-pulse">Generando dirección única...</p>
          </div>
        ) : datosCrypto ? (
          <div className="flex flex-col items-center w-full">
            <div className="bg-white p-2 border rounded-lg shadow-sm mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=tron:${datosCrypto.address}`}
                alt="QR TRX"
                className="h-60 w-60 object-contain mx-auto transition-opacity duration-500"
                onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                style={{ opacity: 0 }}
              />
            </div>

            <div className="space-y-1 w-full text-center">
              <p className="text-[11px] font-mono text-muted-foreground break-all px-2 leading-tight">
                {datosCrypto.address}
              </p>
            </div>

            <p className="mt-4 text-lg font-bold text-emerald-600">
              Monto: {datosCrypto.amount} TRON(TRX)
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-500">
            Error al generar pasarela. Reintenta.
          </p>
        )}
      </div>

      {/* Botón copiar */}
      <Button
        size="lg"
        variant="default"
        disabled={!datosCrypto}
        className="w-full font-bold text-lg py-7 shadow-md bg-[#1D3547] hover:bg-[#1D3547]/90 uppercase"
        onClick={copiarDireccion}
      >
        COPIAR DIRECCIÓN DE PAGO
      </Button>

      <p className="mt-4 text-[11px] text-center text-muted-foreground uppercase tracking-wider">
        * Red: TRON (TRC-20). Solo envía TRX a esta dirección.
      </p>
    </div>
  );
};
