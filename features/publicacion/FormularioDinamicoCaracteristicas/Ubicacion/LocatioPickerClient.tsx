"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("./LocationPicker"),
  { 
    ssr: false,
    loading: () => <div className="h-[256px] w-full flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">Cargando mapa...</div>
  }
);

export const LocationPickerClient = () => {
  return (
    <LocationPicker 
      onChange={(data) => {
        console.log("Ubicación en el mapa:", data);
      }} 
    />
  );
};