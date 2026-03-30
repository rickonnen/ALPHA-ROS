import HistorialPagosPage from "@/app/frontend/cobros/historial-pagos/page";

export default function HistorialPagosView({ id_usuario }: { id_usuario: string }) {
  return (
    <div className="p-4 md:p-6">
      {/* titulo*/}
      <h2 className="text-xl md:text-2xl font-bold mb-4">
        Historial de Pagos
      </h2>

      {/* contenido */}
      <HistorialPagosPage id_usuario={id_usuario} />
    </div>
  );
}