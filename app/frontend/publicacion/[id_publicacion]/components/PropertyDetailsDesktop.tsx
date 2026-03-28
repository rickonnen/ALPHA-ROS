/**
 * Dev: Marcela C.
 * Funcionalidad: Versión Desktop de detalles técnicos (Grid 2 columnas)
 */
import React from "react";
import { PerfilDetallesProps, DetalleItem } from "./PropertyDetails";

export const PropertyDetailsDesktop = ({ objInfo }: PerfilDetallesProps) => (
  <section className="hidden md:block bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-black/5 shadow-sm">
    <h2 className="text-2xl font-bold mb-8 border-b border-[#2E2E2E]/5 pb-2 text-[#1F3A4D]">
      Detalles de la propiedad
    </h2>
    <div className="grid grid-cols-2 gap-x-20 gap-y-4">
      <DetalleItem strLabel="Tipo de propiedad" strValor={objInfo.strTipoInmueble} />
      <DetalleItem strLabel="Habitaciones"       strValor={objInfo.intHabitaciones} />
      <DetalleItem strLabel="Tipo de operación" strValor={objInfo.strTipoOperacion} />
      <DetalleItem strLabel="Baños"              strValor={objInfo.intBanos} />
      <DetalleItem strLabel="Departamento"      strValor={objInfo.strDepartamento} />
      <DetalleItem strLabel="Zona"               strValor={objInfo.strZona} />
      <DetalleItem strLabel="Nro de Plantas"    strValor={objInfo.intPlantas} />
      <DetalleItem strLabel="Garajes"            strValor={objInfo.intGarajes} />
    </div>
  </section>
);