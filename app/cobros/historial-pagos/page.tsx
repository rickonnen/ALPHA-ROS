"use client";

import { Suspense } from "react"; 
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaPagos from "./lista-pagos";

function HistorialPagosContent() {
  const searchParams = useSearchParams();
  const id_usuario = searchParams.get("id") || "";

  return (
    <Tabs defaultValue="pendientes" className="w-full">
      <TabsList className="flex gap-2 bg-transparent p-0">
        <TabsTrigger
          value="pendientes"
          className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] hover:bg-[#DAD3C7] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-sm transition"
        >
          PAGOS PENDIENTES
        </TabsTrigger>
        <TabsTrigger
          value="realizados"
          className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] hover:bg-[#DAD3C7] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-sm transition"
        >
          PAGOS REALIZADOS
        </TabsTrigger>
        <TabsTrigger
          value="rechazados"
          disabled
          className="px-4 py-2 text-sm font-medium rounded-md bg-[#D6B0AA] text-white opacity-80 cursor-not-allowed"
        >
          PAGOS RECHAZADOS
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pendientes">
        <ListaPagos estado="pendiente" id_usuario={id_usuario} />
      </TabsContent>
      
      <TabsContent value="realizados">
        <ListaPagos estado="realizado" id_usuario={id_usuario} />
      </TabsContent>
    </Tabs>
  );
}

export default function HistorialPagosPage() {
  return (
    <div className="w-full p-4 md:p-6 font-sans">
      <Suspense fallback={<p className="text-sm text-gray-500">Cargando historial...</p>}>
        <HistorialPagosContent />
      </Suspense>
    </div>
  );
}