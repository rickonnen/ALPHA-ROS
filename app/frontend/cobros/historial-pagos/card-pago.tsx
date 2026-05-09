/**
 * dev: Kevin isnado
 * ultima modif: 25/03/2025 - horas: 6 pm
 * descripcion: Card de pago
 */

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
    <div className="bg-[#F4EFE6] border border-[#E5E0D8] p-4 space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h2 className="font-bold text-sm text-[#2E2E2E] uppercase">
          {pago.estado === "pendiente"
            ? "TRANSACCIÓN PENDIENTE"
            : "TRANSACCIÓN REALIZADA"}
        </h2>
        {pago.estado === "pendiente" ? (
          <span className="bg-[#bac2c8] text-[#313131] text-xs px-3 py-1 rounded-sm">
            VERIFICANDO PAGO
          </span>
        ) : (
          <span className="text-sm text-[#2E2E2E] font-medium">
          </span>
        )}
      </div>

      {/* INFO */}
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-[#6B7280]">Fecha:</span>
          <span className="text-[#2E2E2E]">{pago.fecha}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">Detalle:</span>
          <span className="text-[#2E2E2E]">{pago.detalle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">
            {pago.estado === "pendiente" ? "Monto:" : "Total pagado:"}
          </span>
          <span className="text-[#2E2E2E]">
            ${Number(pago.monto).toFixed(2)}{" "}
            <span className="text-gray-400">
              (≈ Bs {(pago.monto * 7).toFixed(2)})
            </span>
          </span>
        </div>
      </div>

      {/* BOTÓN DESCARGAR COMPROBANTE */}
      {pago.estado === "realizado" && (
        <div className="flex justify-end">
          <Button
            disabled
            className="bg-[#D6B0AA] text-white text-xs cursor-not-allowed"
          >
            DESCARGAR COMPROBANTE
          </Button>
        </div>
      )}
    </div>
  );
}