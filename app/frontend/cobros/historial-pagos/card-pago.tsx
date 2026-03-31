"use client";
/**
 * dev: Kevin isnado
 * ultima modif: 30/03/2026 - horas: 6:15 pm
 * descripcion: Card de pago - Soporte para estados: pendiente, realizado, rechazado.
 */

import { Button } from "@/components/ui/button";

// ✅ CORRECCIÓN: Se exporta la interfaz y se añade "rechazado"
export interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado" | "rechazado";
}

export default function CardPago({ pago }: { pago: Pago }) {
  // Función auxiliar para el texto del Header según el estado
  const getHeaderText = () => {
    switch (pago.estado) {
      case "realizado":
        return "TRANSACCIÓN REALIZADA";
      case "rechazado":
        return "TRANSACCIÓN RECHAZADA";
      default:
        return "TRANSACCIÓN PENDIENTE";
    }
  };

  return (
    <div className="bg-[#F4EFE6] border border-[#E5E0D8] p-4 space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2
          className={`font-bold text-sm uppercase ${pago.estado === "rechazado" ? "text-red-600" : "text-[#2E2E2E]"}`}
        >
          {getHeaderText()}
        </h2>

        {pago.estado === "pendiente" && (
          <span className="bg-[#bac2c8] text-[#313131] text-xs px-3 py-1 rounded-sm">
            VERIFICANDO PAGO
          </span>
        )}

        {pago.estado === "rechazado" && (
          <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-sm border border-red-200">
            PAGO FALLIDO
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
            {pago.estado === "realizado" ? "Total pagado:" : "Monto:"}
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

      {/* MENSAJE DE AYUDA SI ES RECHAZADO */}
      {pago.estado === "rechazado" && (
        <p className="text-[10px] text-red-500 italic text-right">
          Por favor, contacte con soporte técnico para más información.
        </p>
      )}
    </div>
  );
}
