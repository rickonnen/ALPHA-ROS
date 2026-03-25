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

export default function TabsPagos() {
  return (
    <Tabs defaultValue="pendientes" className="w-full">

      {/* Tabs */}
      <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100">
        <TabsTrigger value="pendientes">Pagos pendientes</TabsTrigger>
        <TabsTrigger value="realizados">Pagos realizados</TabsTrigger>

        {/* TAB DESHABILITADO */}
        <TabsTrigger
          value="rechazados"
          disabled
          className="text-red-400 opacity-60 cursor-not-allowed"
        >
          Pagos rechazados
        </TabsTrigger>
      </TabsList>

      {/* CONTENIDO */}
      <TabsContent value="pendientes">
        <ListaPagos estado="pendiente" />
      </TabsContent>

      <TabsContent value="realizados">
        <ListaPagos estado="realizado" />
      </TabsContent>

    </Tabs>
  );
}