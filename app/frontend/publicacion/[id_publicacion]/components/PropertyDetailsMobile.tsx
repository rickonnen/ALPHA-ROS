/**
 * Dev: Marcela C.
 * Date: 27/03/2026
 * Funcionalidad: Vista mobile de detalles del inmueble en lista vertical
 *                (HU4 - Tasks 4.6, 4.7, 4.12)
 * @param objInfo - Objeto con los datos del inmueble (ver PropertyDetails)
 * @return JSX con lista de detalles visible solo en mobile
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