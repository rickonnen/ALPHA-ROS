/**
 * Card de pago elegante
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado";
}

export default function CardPago({ pago }: { pago: Pago }) {
  return (
    <Card className="w-full border border-gray-200 shadow-sm">

      <CardContent className="p-4 space-y-3">

        {/* Header */}
        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-gray-800">
            {pago.estado === "pendiente"
              ? "Transacción pendiente"
              : "Transacción realizada"}
          </h2>

          <span
            className={`text-xs px-2 py-1 rounded-md font-medium
              ${pago.estado === "pendiente"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
              }`}
          >
            {pago.estado === "pendiente"
              ? "Verificando pago"
              : "Pagado"}
          </span>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Fecha y hora:</strong> {pago.fecha}</p>
          <p><strong>Detalle:</strong> {pago.detalle}</p>

          <p>
            <strong>Total:</strong> ${pago.monto} 
            <span className="text-gray-400 ml-2">(≈ Bs {pago.monto * 7})</span>
          </p>
        </div>

        {/* Botón deshabilitado */}
        {pago.estado === "realizado" && (
          <Button
            disabled
            className="mt-2 bg-red-200 text-red-600 cursor-not-allowed"
          >
            Descargar comprobante (No disponible)
          </Button>
        )}

      </CardContent>
    </Card>
  );
}