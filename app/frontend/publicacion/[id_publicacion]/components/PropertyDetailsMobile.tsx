/**
 * Dev: Marcela C.
 * Funcionalidad: Versión Mobile de detalles técnicos (Lista vertical)
 */
import React from "react";
import { PerfilDetallesProps, DetalleItem } from "./PropertyDetails";

export const PropertyDetailsMobile = ({ objInfo }: PerfilDetallesProps) => (
  <section className="block md:hidden bg-white/60 rounded-2xl p-5 border border-black/5">
    <h2 className="text-xl font-bold mb-6 text-[#1F3A4D]">
      Detalles técnicos
    </h2>
    <div className="flex flex-col gap-y-2">
      <DetalleItem strLabel="Propiedad"    strValor={objInfo.strTipoInmueble} />
      <DetalleItem strLabel="Operación"    strValor={objInfo.strTipoOperacion} />
      <DetalleItem strLabel="Ubicación"    strValor={objInfo.strDepartamento} />
      <DetalleItem strLabel="Zona"         strValor={objInfo.strZona} />
      <DetalleItem strLabel="Hab."         strValor={objInfo.intHabitaciones} />
      <DetalleItem strLabel="Baños"        strValor={objInfo.intBanos} />
      <DetalleItem strLabel="Plantas"      strValor={objInfo.intPlantas} />
      <DetalleItem strLabel="Garajes"      strValor={objInfo.intGarajes} />
    </div>
  </section>
);