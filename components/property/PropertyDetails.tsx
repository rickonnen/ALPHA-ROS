/**
 * Dev: Marcela C.
 * Date: 25/03/2026
 * Funcionalidad: Detalles técnicos del inmueble con etiquetas de color sin iconos
 *                (HU4 - Tasks 4.6, 4.7)
 * @param objInfo - Datos técnicos mapeados desde BD real
 */
import React from "react";

interface PerfilDetallesProps {
  objInfo: {
    strTipoInmueble:  string;
    strTipoOperacion: string;
    strDepartamento:  string;
    strZona:          string;
    intHabitaciones:  number;
    intBanos:         number;
    intPlantas:       number;
    intGarajes:       number;
  };
}

export const PropertyDetails = ({ objInfo }: PerfilDetallesProps) => (
  <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-black/5 shadow-sm">
    <h2 className="text-2xl font-bold mb-8 border-b border-[#2E2E2E]/5 pb-2 text-[#1F3A4D]">
      Detalles de la propiedad
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
      {/* Task 4.6: Datos de texto con etiqueta color */}
      <DetalleItem strLabel="Tipo de propiedad"  strValor={objInfo.strTipoInmueble} />
      <DetalleItem strLabel="Habitaciones"       strValor={objInfo.intHabitaciones} />
      <DetalleItem strLabel="Tipo de operación"  strValor={objInfo.strTipoOperacion} />
      <DetalleItem strLabel="Baños"              strValor={objInfo.intBanos} />
      <DetalleItem strLabel="Departamento"       strValor={objInfo.strDepartamento} />
      <DetalleItem strLabel="Zona"               strValor={objInfo.strZona} />
      <DetalleItem strLabel="Nro de Plantas"     strValor={objInfo.intPlantas} />
      <DetalleItem strLabel="Garajes"            strValor={objInfo.intGarajes} />
    </div>
  </section>
);

const DetalleItem = ({
  strLabel,
  strValor,
}: {
  strLabel: string;
  strValor: string | number;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-[#2E2E2E]/5 last:border-0">
    <span className="text-[#2E2E2E]/70 font-medium">{strLabel}</span>
    <span className="bg-[#C26E5A] text-white px-5 py-1 rounded-full text-sm font-bold min-width: 50px text-center">
      {strValor ?? "—"}
    </span>
  </div>
);