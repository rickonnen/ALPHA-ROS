"use client";

/**
 * dev: Kevin isnado
 * ultima modif: 27/03/2025 - horas: 12 pm
 * descripcion: lista de pagos - paginacion - se muestran las 10 transacciones mas recientes
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

export default function ListaPagos({ estado }: { estado: "pendiente" | "realizado" }) {
  const [pagina, setPagina] = useState(1);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //FETCH AL BACKEND
  useEffect(() => {
    obtenerPagos();
  }, [estado]);

  const obtenerPagos = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `/backend/cobros/historial-pagos?estado=${estado}`
      );

      const data = await res.json();

      setPagos(data);
      setError("");
    } catch (err) {
      setError("No fue posible cargar el historial de pagos. Intente nuevamente.");
    }

    setLoading(false);
  };

  // ADAPTAR DATOS A UI
  const pagosAdaptados: Pago[] = pagos.map((p: any) => ({
    id: p.id_detalle,
    fecha: p.fecha_detalle,
    detalle: p.metodo_pago,
    monto: 100, // temporal (luego conectamos con PlanPublicacion)
    estado: p.estado === 0 ? "pendiente" : "realizado",
  }));

  // LOADING
  if (loading) {
    return <p className="text-sm text-gray-500">Cargando...</p>;
  }

  // ERROR
  if (error) {
    return (
      <p className="text-sm text-red-500">
        No fue posible cargar el historial de pagos. Intente nuevamente.
      </p>
    );
  }

  //SIN DATOS
  if (pagosAdaptados.length === 0) {
    return <EstadoVacio />;
  }

  //PAGINACIÓN (igual que tu lógica)
  const totalPaginas = Math.ceil(pagosAdaptados.length / ITEMS);
  const inicio = (pagina - 1) * ITEMS;
  const datos = pagosAdaptados.slice(inicio, inicio + ITEMS);

  return (
    <div className="mt-4 space-y-3">

      {/* BARRA SUPERIOR (DESHABILITADA) */}
      <div className="bg-[#E8A5A0] text-white text-sm px-4 py-2 flex justify-between items-center opacity-80">
        <span>Últimos 30 días (17/02/2026 - 19/03/2026)</span>
      </div>

      {/* LISTA */}
      {datos.map(p => (
        <CardPago key={p.id} pago={p} />
      ))}

      {/* PAGINACIÓN */}
      <div className="flex justify-end gap-2 text-sm text-[#2E2E2E]">

        <button onClick={() => setPagina(p => Math.max(p - 1, 1))}>
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

        <button onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}>
          →
        </button>

      </div>

    </div>
  );
}