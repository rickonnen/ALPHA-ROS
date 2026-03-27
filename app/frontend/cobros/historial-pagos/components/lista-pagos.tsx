"use client";

/**
 * dev: Kevin isnado
 * fix: conexión API + adaptación de datos + control de errores
 */

import { useState, useEffect } from "react";
import CardPago from "./card-pago";
import EstadoVacio from "./estado-vacio";

interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado";
}

const ITEMS = 10;

const formatearFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO);

  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ListaPagos({ estado }: { estado: "pendiente" | "realizado" }) {
  const [pagina, setPagina] = useState(1);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerPagos();
  }, [estado]);

  const obtenerPagos = async () => {
    setLoading(true);
    setError("");

    try {
    
      const res = await fetch(`/api/pagos?estado=${estado}`);

      if (!res.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await res.json();

      console.log("DATA API:", data);

      setPagos(data);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar el historial de pagos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const pagosAdaptados: Pago[] = pagos.map((p: any) => ({
  id: p.id_detalle_pago ?? p.id,
  fecha: formatearFecha(p.fecha_detalle),
  detalle: p.detalle ?? p.metodo_pago ?? "Sin detalle",
  monto: p.monto ?? 0,
  estado: p.estado === 0 ? "pendiente" : "realizado",
}));

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        {error}
      </p>
    );
  }

  if (pagosAdaptados.length === 0) {
    return <EstadoVacio />;
  }

  const totalPaginas = Math.ceil(pagosAdaptados.length / ITEMS);
  const inicio = (pagina - 1) * ITEMS;
  const datos = pagosAdaptados.slice(inicio, inicio + ITEMS);

  return (
    <div className="mt-4 space-y-3">

      <div className="bg-[#E8A5A0] text-white text-sm px-4 py-2 flex justify-between items-center opacity-80">
        <span>Últimos 30 días (17/02/2026 - 19/03/2026)</span>
      </div>

      {datos.map((p) => (
        <CardPago key={p.id} pago={p} />
      ))}

      <div className="flex justify-end gap-2 text-sm text-[#2E2E2E]">

        <button onClick={() => setPagina((p) => Math.max(p - 1, 1))}>
          ←
        </button>

        {Array.from({ length: totalPaginas }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPagina(i + 1)}
            className={pagina === i + 1 ? "font-bold" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}>
          →
        </button>

      </div>

    </div>
  );
}