/**
 * Dev: Marcela C.
 * Date: 25/03/2026
 * Funcionalidad: Punto de entrada para detalles del inmueble (HU4)
 */
import React from "react";
import { PropertyDetailsDesktop } from "./PropertyDetailsDesktop";
import { PropertyDetailsMobile } from "./PropertyDetailsMobile";

export interface PerfilDetallesProps {
  objInfo: {
    strTipoInmueble:  string;
    strTipoOperacion: string;
    strDepartamento:  string;
    strZona:           string;
    intHabitaciones:   number;
    intBanos:          number;
    intPlantas:        number;
    intGarajes:        number;
  };
}

export const PropertyDetails = (props: PerfilDetallesProps) => {
  return (
    <>
      <PropertyDetailsDesktop {...props} />
      <PropertyDetailsMobile {...props} />
    </>
  );
};

// Componente de ítem reutilizable
export const DetalleItem = ({
  strLabel,
  strValor,
}: {
  strLabel: string;
  strValor: string | number;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-[#2E2E2E]/5 last:border-0">
    <span className="text-[#2E2E2E]/70 font-medium text-sm md:text-base">{strLabel}</span>
    <span className="bg-[#C26E5A] text-white px-4 md:px-5 py-1 rounded-full text-xs md:text-sm font-bold min-w-12.5 text-center">
      {strValor ?? "—"}
    </span>
  </div>
);