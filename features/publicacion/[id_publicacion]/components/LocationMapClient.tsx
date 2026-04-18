/**
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Componente envoltorio (wrapper) de cliente que importa dinámicamente el mapa de Leaflet (LocationDisplay) desactivando el renderizado del lado del servidor (SSR: false). Esto previene errores de "window is not defined" y provee un estado de carga (skeleton) mientras se obtienen los recursos de la librería.
 * @param {number} lat - Coordenada de latitud que se delegará al componente del mapa.
 * @param {number} lng - Coordenada de longitud que se delegará al componente del mapa.
 * @return {JSX.Element} Componente de mapa cargado de forma asíncrona o su interfaz de carga.
 */
"use client";

import dynamic from "next/dynamic";

const LocationDisplay = dynamic(
  () => import("./LocationDisplay"),
  { 
    ssr: false, 
    loading: () => <div className="h-[280px] md:h-[350px] w-full flex items-center justify-center bg-slate-100 rounded-3xl text-slate-400">Cargando ubicación...</div> 
  }
);
export const LocationMapClient = ({ lat, lng }: { lat: number; lng: number }) => {
  return <LocationDisplay lat={lat} lng={lng} />;
};