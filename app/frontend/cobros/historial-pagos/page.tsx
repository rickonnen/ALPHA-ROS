"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Pago { id: number; fecha: string; detalle: string; monto: number; estado: "pendiente" | "realizado"; }

function CardPago({ pago }: { pago: Pago }) {
  return (
    <div className="bg-[#F4EFE6] border border-[#E5E0D8] p-4 space-y-3 rounded-md">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-sm text-[#2E2E2E] uppercase">{pago.estado === "pendiente" ? "TRANSACCIÓN PENDIENTE" : "TRANSACCIÓN REALIZADA"}</h2>
        {pago.estado === "pendiente" ? (
          <span className="bg-[#bac2c8] text-[#313131] text-xs px-3 py-1 rounded-sm">VERIFICANDO PAGO</span>
        ) : (
          <span className="text-sm text-[#2E2E2E] font-medium" />
        )}
      </div>
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-[#6B7280]">Fecha:</span>
          <span className="text-[#2E2E2E]">{pago.fecha}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">Detalle:</span>
          <span className="text-[#2E2E2E]">{pago.detalle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#6B7280]">{pago.estado === "pendiente" ? "Monto:" : "Total pagado:"}</span>
          <span className="text-[#2E2E2E]">
            ${Number(pago.monto).toFixed(2)} <span className="text-gray-400">(≈ Bs {(pago.monto * 7).toFixed(2)})</span>
          </span>
        </div>
      </div>
      {pago.estado === "realizado" && (
        <div className="flex justify-end">
          <Button disabled className="bg-[#D6B0AA] text-white text-xs cursor-not-allowed">DESCARGAR COMPROBANTE</Button>
        </div>
      )}
    </div>
  );
}

function EstadoVacio() {
  return <div className="text-center py-10 text-gray-500 text-sm">No existen pagos registrados.</div>;
}

function ListaPagos({ estado, id_usuario }: { estado: "pendiente" | "realizado"; id_usuario: string }) {
  const ITEMS = 5;
  const [pagina, setPagina] = useState(1);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { obtenerPagos(); }, [estado, id_usuario]);

  const obtenerPagos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/backend/cobros/historial-pagos?estado=${estado}&id_usuario=${id_usuario}`);
      const data = await res.json();
      const nuevosPagos = Array.isArray(data) ? data : data.data || [];
      setPagos(nuevosPagos);
      setError("");
      const total = Math.ceil(nuevosPagos.length / ITEMS);
      setPagina((prev) => (prev > total ? total || 1 : prev));
    } catch { setError("No fue posible cargar el historial de pagos."); }
    setLoading(false);
  };

  const pagosAdaptados: Pago[] = Array.isArray(pagos)
    ? pagos.map((p: any) => ({
        id: p.id_detalle,
        fecha: p.fecha_detalle.split("T")[0],
        detalle: `${p.metodo_pago} - ${p.PlanPublicacion?.nombre_plan || "Plan"} (${p.PlanPublicacion?.cant_publicaciones || 0} publicaciones)`,
        monto: Number(p.PlanPublicacion?.precio_plan || 0),
        estado: p.estado === 2 ? "realizado" : p.estado === 3 ? "rechazado" : "pendiente",
      }))
    : [];

  if (loading) return <p className="text-sm text-gray-500">Cargando...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (pagosAdaptados.length === 0) return <EstadoVacio />;

  const totalPaginas = Math.ceil(pagosAdaptados.length / ITEMS);
  const datos = pagosAdaptados.slice((pagina - 1) * ITEMS, pagina * ITEMS);

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#E8A5A0] text-black text-sm px-4 py-2 rounded-md flex justify-between">
        <span>Últimos 30 días</span>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {datos.map((p) => <CardPago key={p.id} pago={p} />)}
      </div>
      {totalPaginas > 1 && (
        <Pagination className="justify-end pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPagina((p) => Math.max(p - 1, 1))} />
            </PaginationItem>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <PaginationItem key={num}>
                <PaginationLink isActive={pagina === num} onClick={() => setPagina(num)}>{num}</PaginationLink>
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

export default function HistorialPagosPage({ id_usuario }: { id_usuario: string }) {
  return (
    <div className="w-full p-4 md:p-6">
      <Tabs defaultValue="pendientes" className="w-full space-y-4">
        <TabsList className="flex gap-2 bg-transparent p-0">
          <TabsTrigger value="pendientes" className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-white">PAGOS PENDIENTES</TabsTrigger>
          <TabsTrigger value="realizados" className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-white">PAGOS REALIZADOS</TabsTrigger>
          <TabsTrigger value="rechazados" disabled className="px-4 py-2 text-sm font-medium rounded-md bg-[#D6B0AA] text-white opacity-80">PAGOS RECHAZADOS</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes">
          <ListaPagos estado="pendiente" id_usuario={id_usuario} />
        </TabsContent>
        <TabsContent value="realizados">
          <ListaPagos estado="realizado" id_usuario={id_usuario} />
        </TabsContent>
      </Tabs>
    </div>
  );
}