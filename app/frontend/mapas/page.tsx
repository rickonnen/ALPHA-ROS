"use client"

import dynamic from "next/dynamic";

const MapClient = dynamic(
  () => import("./MapClient").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 animate-pulse">
        Cargando Mapa...
      </div>
    ),
  }
);

export default function MapasPage() {
  return (
    <div className="h-screen w-full">
      <MapClient />
    </div>
  );
}