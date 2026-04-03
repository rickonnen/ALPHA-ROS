/**
 * dev: Kevin isnado
 * ultima modif: 03/04/2025 - horas: 5 pm
 * descripcion: lista de pagos - paginacion - se muestran las 10 transacciones mas recientes
 */
"use client";

import { useState, useEffect } from "react";
import CardPago from "./card-pago";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado" | "rechazado";
}

const ITEMS = 10;

export default function ListaPagos({ estado, id_usuario }: { estado: "pendiente" | "realizado" | "rechazado"; id_usuario: string }) {
  const [pagina, setPagina] = useState(1);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerPagos();
  }, [estado, id_usuario]);

  const obtenerPagos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cobros/historial-pagos?estado=${estado}&id_usuario=${id_usuario}`);
      const data = await res.json();
      const nuevosPagos = Array.isArray(data) ? data : data.data || [];
      setPagos(nuevosPagos);
      setError("");
      const nuevoTotal = Math.ceil(nuevosPagos.length / ITEMS);
      setPagina((prev) => (prev > nuevoTotal ? nuevoTotal || 1 : prev));
    } catch (err) {
      setError("No fue posible cargar el historial de pagos. Intente nuevamente.");
    }
    setLoading(false);
  };

  const pagosAdaptados: Pago[] = Array.isArray(pagos) ? pagos.map((p: any) => ({
    id: p.id_detalle,
    fecha: p.fecha_detalle?.split("T")[0] || "S/F",
    detalle: `${p.metodo_pago} - ${p.PlanPublicacion?.nombre_plan || "Plan"} (${p.PlanPublicacion?.cant_publicaciones || 0} publicaciones)`,
    monto: Number(p.PlanPublicacion?.precio_plan || 0),
    estado: p.estado === 2 ? "realizado" : p.estado === 3 ? "rechazado" : "pendiente",
  })) : [];

  if (loading) return <p className="text-sm text-gray-500">Cargando...</p>;

  if (error) return <div className="text-center py-10 text-red-500 text-sm">{error}</div>;

  if (pagosAdaptados.length === 0) return <div className="text-center py-10 text-gray-500 text-sm">No existen pagos registrados.</div>;

  const totalPaginas = Math.ceil(pagosAdaptados.length / ITEMS);
  const datos = pagosAdaptados.slice((pagina - 1) * ITEMS, pagina * ITEMS);

  return (
    <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2">
      <div className="bg-[#E8A5A0] text-black text-sm px-4 py-2 flex justify-between items-center opacity-80">
        <span>Últimos 30 días (17/02/2026 - 19/03/2026)</span>
      </div>
      {datos.map((p) => (
        <CardPago key={p.id} pago={p} />
      ))}
      {totalPaginas > 1 && (
        <Pagination className="justify-end cursor-pointer">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPagina((p) => Math.max(p - 1, 1))} />
            </PaginationItem>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <PaginationItem key={num}>
                <PaginationLink isActive={pagina === num} onClick={() => setPagina(num)}>
                  {num}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}