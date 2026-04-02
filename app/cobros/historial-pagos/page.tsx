"use client";

import { Suspense } from "react"; // ✅ Añadido Suspense
import { useSearchParams } from "next/navigation";
import TabsPagos from "./tabs-pagos";

// 1. Cambiamos el nombre y quitamos el export default
function HistorialPagosContent() {
  const searchParams = useSearchParams();
  const id_usuario = searchParams.get("id") || "";

  return <TabsPagos id_usuario={id_usuario} />;
}

// ✅ 2. Exportamos el nuevo componente con Suspense
export default function HistorialPagosPage() {
  return (
    <div className="w-full p-4 md:p-6 font-sans">
      <Suspense
        fallback={
          <p className="text-sm text-gray-500">Cargando historial...</p>
        }
      >
        <HistorialPagosContent />
      </Suspense>
    </div>
  );
}
