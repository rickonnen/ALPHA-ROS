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