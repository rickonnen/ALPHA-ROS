"use client";

import { useState, useEffect } from "react";
import CardPago from "./card-pago";
import { Button } from "@/components/ui/button";

interface Pago {
  id: number;
  fecha: string;
  detalle: string | React.ReactNode;
  monto: number;
  estado: "pendiente" | "realizado" | "rechazado";
}

interface PagoApi {
  id_detalle: number;
  fecha_detalle: string | null;
  metodo_pago: string;
  estado: number;
  PlanPublicacion?: {
    nombre_plan: string;
    cant_publicaciones: number;
    precio_plan: number;
  };
  Publicacion?: {
    titulo: string | null;
  } | null;
}

const ITEMS = 5;

export default function ListaPagos({ estado, id_usuario, fechaFiltro }: { estado: "pendiente" | "realizado" | "rechazado"; id_usuario: string; fechaFiltro?: Date }) {
  const [pagina, setPagina] = useState(1);
  const [pagos, setPagos] = useState<PagoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerPagos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cobros/historial-pagos?estado=${estado}&id_usuario=${id_usuario}`);
        const data = await res.json();
        const nuevosPagos: PagoApi[] = Array.isArray(data) ? data : data.data || [];
        
        setPagos(nuevosPagos);
        setError("");
        
        const nuevoTotal = Math.ceil(nuevosPagos.length / ITEMS);
        setPagina((prev) => (prev > nuevoTotal ? nuevoTotal || 1 : prev));
      } catch {
        setError("No fue posible cargar el historial de pagos. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    if (id_usuario) {
      obtenerPagos();
    }
  }, [estado, id_usuario]);

  const pagosAdaptados: Pago[] = Array.isArray(pagos) ? pagos.map((p) => {
    const detallePlan = `${p.metodo_pago} - ${p.PlanPublicacion?.nombre_plan || "Plan"} (${p.PlanPublicacion?.cant_publicaciones || 0} publicaciones)`;
    
    return {
      id: p.id_detalle,
      fecha: p.fecha_detalle
        ? new Date(p.fecha_detalle).toLocaleString("es-BO", {
          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
        })
        : "S/F",
      detalle: p.Publicacion?.titulo ? (
        <span>
          <span className="text-[#c26e5a] font-bold">{p.Publicacion.titulo}</span> - {detallePlan}
        </span>
      ) : (
        detallePlan
      ),
      monto: Number(p.PlanPublicacion?.precio_plan || 0),
      estado: p.estado === 2 ? "realizado" : p.estado === 3 ? "rechazado" : "pendiente",
    };
  }) : [];

  const pagosFiltrados = fechaFiltro
    ? pagosAdaptados.filter((p: Pago, i: number) => {
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

  if (loading) {
    return (
      <div className="mt-1 flex flex-col max-h-[50vh] md:max-h-300px overflow-hidden">
        <div className="space-y-3 mt-1 pr-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#f9f5f1]/40 border border-[#d6cfc3] p-5 rounded-xl space-y-4 animate-pulse">
              <div className="flex justify-between items-center mb-1">
                <div className="h-4 bg-[#7a756d]/20 rounded w-1/3"></div>
                <div className="h-5 bg-[#7a756d]/20 rounded-full w-24"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-[#7a756d]/10 rounded w-20"></div>
                  <div className="h-3 bg-[#7a756d]/10 rounded w-32"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-[#7a756d]/10 rounded w-16"></div>
                  <div className="h-3 bg-[#7a756d]/10 rounded w-48"></div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="h-3 bg-[#7a756d]/10 rounded w-24"></div>
                  <div className="h-4 bg-[#7a756d]/20 rounded w-28"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-start mt-6">
        <div className="bg-[#f9f5f1] text-[#2e2e2e] text-sm px-8 py-4 rounded-lg shadow-sm border border-[#d6cfc3]">
          {error}
        </div>
      </div>
    );
  }

  if (pagosFiltrados.length === 0) return <div className="text-center py-10 text-[#7a756d] text-sm font-medium">No existen pagos registrados.</div>;

  const totalPaginas = Math.ceil(pagosFiltrados.length / ITEMS);
  const datos = pagosFiltrados.slice((pagina - 1) * ITEMS, pagina * ITEMS);

  return (
    <div className="mt-1 flex flex-col max-h-[50vh] md:max-h-300px">
      <style>{`
        .scrollbar-light-fixed {
          scrollbar-color: #d6cfc3 transparent !important;
        }
        .scrollbar-light-fixed::-webkit-scrollbar-thumb {
          background-color: #d6cfc3 !important;
        }
        .scrollbar-light-fixed::-webkit-scrollbar-thumb:hover {
          background-color: #1f3a4d !important;
        }
      `}</style>
      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-custom scrollbar-light-fixed">
        {datos.map((p) => (
          <CardPago 
            key={p.id} 
            pago={p as unknown as { id: number; fecha: string; detalle: string; monto: number; estado: "pendiente" | "realizado" | "rechazado"; }} 
          />
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <Button variant="ghost" size="sm" className="text-[#7a756d] hover:text-[#2e2e2e] disabled:opacity-30 hover:bg-[#f9f5f1]" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>‹</Button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <Button key={num} variant="ghost" size="sm" onClick={() => setPagina(num)} className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${pagina === num ? "bg-[#1f3a4d] text-[#f4efe6] hover:bg-[#1f3a4d]/90" : "text-[#7a756d] hover:text-[#2e2e2e] hover:bg-[#f9f5f1]"}`}>{num}</Button>
          ))}
          <Button variant="ghost" size="sm" className="text-[#7a756d] hover:text-[#2e2e2e] disabled:opacity-30 hover:bg-[#f9f5f1]" onClick={() => setPagina((p) => p + 1)} disabled={pagina === totalPaginas}>›</Button>
        </div>
      )}
    </div>
  );
}