/**
 * Dev: Marcela C.
 * Date: 17/04/2026
 * Funcionalidad: Punto de entrada para detalles del inmueble
 * @param objInfo - Objeto extendido con datos generales, específicos y características
 * @return JSX con versión desktop y mobile de los detalles separados por sección
 */
import React from "react";
import { PropertyDetailsDesktop } from "./PropertyDetailsDesktop";
import { PropertyDetailsMobile }  from "./PropertyDetailsMobile";

export interface CaracteristicaItem {
  strNombre:  string;
  strDetalle: string | null;
}

export interface PerfilDetallesProps {
  objInfo: {
    // Datos Generales
    strTipoInmueble:        string;
    strTipoOperacion:       string;
    strDepartamento:        string;
    strZona:                string;
    strEstadoConstruccion:  string;
    // Datos Específicos (predeterminados)
    intHabitaciones:        number;
    intBanos:               number;
    intPlantas:             number;
    intGarajes:             number;
    // Características adicionales
    arrCaracteristicas:     CaracteristicaItem[];
  };
}

export const PropertyDetails = (props: PerfilDetallesProps) => (
  <>
    <PropertyDetailsDesktop {...props} />
    <PropertyDetailsMobile  {...props} />
  </>
);

export const DetalleItem = ({
  strLabel,
  strValor,
}: {
  strLabel: string;
  strValor: string | number;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-[#2E2E2E]/5 last:border-0">
    <span className="text-[#2E2E2E]/70 font-medium text-base">{strLabel}</span>
    <span className="bg-[#C26E5A] text-white px-4 md:px-5 py-1 rounded-full text-base font-bold min-w-12.5 text-center">
      {strValor ?? "—"}
    </span>
  </div>
);

export const CaracteristicaCard = ({ strNombre, strDetalle }: CaracteristicaItem) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 border border-black/5 shadow-sm flex flex-col items-center gap-1 min-h-[100px]">
    <h4 className="font-bold text-base text-[#1F3A4D] text-center border-b border-[#2E2E2E]/10 pb-2 w-full">
      {strNombre}
    </h4>
    <div className="flex-1 flex items-center justify-center w-full">
      {strDetalle && (
        <p className="text-sm text-[#2E2E2E] leading-relaxed text-center">
          {strDetalle}
        </p>
      )}
    </div>
  </div>
);