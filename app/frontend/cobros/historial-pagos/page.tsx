/**
 * dev: Kevin Isnado
 * Date: 24/03/26
 * Description: Pagina principal de historial de pagos
 */

import TabsPagos from "./components/tabs-pagos";

export default function HistorialPagosPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">
        Historial de pagos
      </h1>

      <TabsPagos />
    </div>
  );
}