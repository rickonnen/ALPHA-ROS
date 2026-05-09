"use client";
/**
 * dev: Kevin isnado
 * ultima modif: 25/03/2025 - horas: 6 pm
 * descripcion: pagina historial de pagos
 */

import TabsPagos from "./tabs-pagos";

export default function HistorialPagosPage({ id_usuario }: { id_usuario: string }) {
  return (
    <div className="w-full p-4 md:p-6 font-sans">
      <TabsPagos id_usuario={id_usuario} />
    </div>
  );
}