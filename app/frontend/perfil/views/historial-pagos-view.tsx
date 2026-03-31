"use client";
/**
 * dev: Kevin isnado
 * descripcion: Vista intermedia del historial de pagos dentro del perfil
 */
import HistorialPagosPage from "@/app/frontend/cobros/historial-pagos/page";

export default function HistorialPagosView() {
  return (
    <div className="w-full">
      {/* ✅ CORRECCIÓN: Quitamos la prop id_usuario ya que el componente la lee de la URL */}
      <HistorialPagosPage />
    </div>
  );
}
