"use client";

import { useState, useEffect } from "react";
import CardPago from "./card-pago";
import { Button } from "@/components/ui/button";

interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado" | "rechazado";
}

const ITEMS = 5;

export default function ListaPagos({ estado, id_usuario, fechaFiltro }: { estado: "pendiente" | "realizado" | "rechazado"; id_usuario: string; fechaFiltro?: Date }) {
  const [pagina, setPagina] = useState(1);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagosPrevios, setPagosPrevios] = useState<any[]>([]);

  useEffect(() => {
    if (!id_usuario) {
      setLoading(true);
      return;
    }
    obtenerPagos();
  }, [estado, id_usuario]);

  const obtenerPagos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cobros/historial-pagos?estado=${estado}&id_usuario=${id_usuario}`);
      const data = await res.json();
      const nuevosPagos = Array.isArray(data) ? data : data.data || [];
      setPagos(nuevosPagos);
      const cambios = nuevosPagos.filter((p: any) => {
        const anterior = pagosPrevios.find(x => x.id_detalle === p.id_detalle);

        return (
          anterior &&
          anterior.estado !== p.estado &&
          (p.estado === 2 || p.estado === 3)
        );
      });

      for (const pago of cambios) {
        await fetch("/api/notificaciones", {
          method: "POST",
          body: JSON.stringify({
            tipo: "pago",
            pago: {
              estado: pago.estado,
              monto: pago.PlanPublicacion?.precio_plan || 0,
            },
          }),
        });
      }

      setPagosPrevios(nuevosPagos);
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
    fecha: p.fecha_detalle
      ? new Date(p.fecha_detalle).toLocaleString("es-BO", {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
      })
      : "S/F",
    detalle: `${p.metodo_pago} - ${p.PlanPublicacion?.nombre_plan || "Plan"} (${p.PlanPublicacion?.cant_publicaciones || 0} publicaciones)`,
    monto: Number(p.PlanPublicacion?.precio_plan || 0),
    estado: p.estado === 2 ? "realizado" : p.estado === 3 ? "rechazado" : "pendiente",
  })) : [];

  const pagosFiltrados = fechaFiltro
    ? pagosAdaptados.filter((p: any, i: number) => {
      const original = pagos[i]?.fecha_detalle;
      if (!original) return false;
      const fechaPago = new Date(original);
      return (
        fechaPago.getFullYear() === fechaFiltro.getFullYear() &&
        fechaPago.getMonth() === fechaFiltro.getMonth() &&
        fechaPago.getDate() === fechaFiltro.getDate()
      );
    })
    : pagosAdaptados;

  if (loading) return <p className="text-sm text-gray-500">Cargando...</p>;

  if (error) {
    return (
      <div className="flex justify-center items-start mt-6">
        <div className="bg-[#F5F5F5] text-[#2E2E2E] text-sm px-8 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (pagosFiltrados.length === 0) return <div className="text-center py-10 text-gray-500 text-sm">No existen pagos registrados.</div>;

  const totalPaginas = Math.ceil(pagosFiltrados.length / ITEMS);
  const datos = pagosFiltrados.slice((pagina - 1) * ITEMS, pagina * ITEMS);

  return (
    <div className="mt-1 flex flex-col max-h-[50vh] md:max-h-[300px]">
      <div className="space-y-3 overflow-y-auto pr-2">
        {datos.map((p) => (
          <CardPago key={p.id} pago={p} />
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white disabled:opacity-30" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>‹</Button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <Button key={num} variant="ghost" size="sm" onClick={() => setPagina(num)} className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${pagina === num ? "bg-white text-[var(--primary)] text-black" : "text-white/60 hover:text-white"}`}>{num}</Button>
          ))}
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white disabled:opacity-30" onClick={() => setPagina((p) => p + 1)} disabled={pagina === totalPaginas}>›</Button>
        </div>
      )}
    </div>
  );
}