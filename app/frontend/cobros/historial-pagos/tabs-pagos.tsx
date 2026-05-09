"use client";
/**
 * dev: Kevin isnado
 * ultima modif: 25/03/2025 - horas: 6 pm
 * descripcion: tabs de pagos
 */
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ListaPagos from "./lista-pagos";

export default function TabsPagos({ id_usuario }: { id_usuario: string }) {
  return (
    <Tabs defaultValue="pendientes" className="w-full">
      <TabsList className="flex gap-2 bg-transparent p-0">

        {/* PENDIENTES */}
        <TabsTrigger
          value="pendientes"
          className="
            px-4 py-2 text-sm font-medium rounded-md
            bg-[#DDE1E4] text-[#2E2E2E]
            hover:bg-[#DAD3C7]
            data-[state=active]:bg-[#1F3A4D]
            data-[state=active]:text-[#ffffff]
            data-[state=active]:shadow-sm
            transition
          "
        >
          PAGOS PENDIENTES
        </TabsTrigger>

        {/* REALIZADOS */}
        <TabsTrigger
          value="realizados"
          className="
            px-4 py-2 text-sm font-medium rounded-md
            bg-[#DDE1E4] text-[#2E2E2E]
            hover:bg-[#DAD3C7]
            data-[state=active]:bg-[#1F3A4D]
            data-[state=active]:text-[#ffffff]
            data-[state=active]:shadow-sm
            transition
          "
        >
          PAGOS REALIZADOS
        </TabsTrigger>

        {/* RECHAZADOS (DESHABILITADO) */}
        <TabsTrigger
          value="rechazados"
          disabled
          className="
            px-4 py-2 text-sm font-medium rounded-md
            bg-[#D6B0AA] text-white
            opacity-80 cursor-not-allowed
          "
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