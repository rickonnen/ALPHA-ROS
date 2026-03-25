"use client";

/**
 * Historial de Pagos
 */

import TabsPagos from "./components/tabs-pagos";

export default function HistorialPagosPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-4 font-sans">

      <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
        Historial de pagos
      </h1>

      <TabsPagos />
    </div>
  );
}