/**
 * dev: Kevin Isnado
 * Date: 24/03/26
 * Description: Pagina principal de historial de pagos
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Pago {
  id: number;
  plan: string;
  fecha: string;
  monto: number;
  estado: "pendiente" | "realizado";
}

export default function CardPago({ pago }: { pago: Pago }) {
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-2">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          
          <h2 className="font-semibold">
            {pago.estado === "pendiente"
              ? "Transacción pendiente"
              : "Transacción realizada"}
          </h2>

          <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 md:mt-0">
            {pago.estado === "pendiente"
              ? "Verificando pago"
              : "Pagado"}
          </span>
        </div>

        <div className="text-sm">
          <p><strong>Fecha y hora:</strong> {pago.fecha}</p>
          <p><strong>Detalle:</strong> {pago.plan}</p>
          <p><strong>Total pagado:</strong> $ {pago.monto}</p>
        </div>

        {pago.estado === "realizado" && (
          <Button variant="secondary" className="mt-2">
            Descargar comprobante
          </Button>
        )}
      </CardContent>
    </Card>
  );
}