/**
 * dev: Kevin Isnado
 * Date: 24/03/26
 * Description: Pagina principal de historial de pagos
 */

"use client";

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
      
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pendientes">Pagos pendientes</TabsTrigger>
        <TabsTrigger value="realizados">Pagos realizados</TabsTrigger>
      </TabsList>

      <TabsContent value="pendientes">
        <ListaPagos estado="pendiente" />
      </TabsContent>

      <TabsContent value="realizados">
        <ListaPagos estado="realizado" />
      </TabsContent>

    </Tabs>
  );
}