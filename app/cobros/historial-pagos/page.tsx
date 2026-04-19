"use client";

import { Suspense } from "react"; 
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListaPagos from "../../../components/cobros/lista-pagos";

function HistorialPagosContent() {
  const searchParams = useSearchParams();
  const id_usuario = searchParams.get("id") || "";

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
          Historial de pagos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col">
        <Tabs defaultValue="pendientes" className="w-full mt-2">
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
              className="px-4 py-2 text-sm font-medium rounded-md bg-[#D6B0AA] text-white opacity-80"
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
          <TabsContent value="rechazados">
            <ListaPagos estado="rechazado" id_usuario={id_usuario} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function HistorialPagosPage() {
  return (
    <Suspense fallback={<p className="text-sm text-white/50 p-6">Cargando historial...</p>}>
      <HistorialPagosContent />
    </Suspense>
  );
}