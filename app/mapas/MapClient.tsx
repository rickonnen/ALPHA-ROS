// app/mapas/MapClient.tsx
"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { locations, Location } from "@/lib/locations-placeholder-data"
import { Button } from "@/components/ui/button"
import PropertyCard from "./components/PropertyCard"

const PropertyMap = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
      Cargando mapa...
    </div>
  ),
})

export default function MapClient() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [hoveredPos, setHoveredPos] = useState<[number, number] | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* FILTROS (HU1) */}
      <aside className="w-48 shrink-0 border-r p-6 bg-slate-50/50 hidden md:flex flex-col gap-6">
        <h2 className="font-semibold tracking-tight uppercase text-slate-400 text-[10px]">Filtros</h2>
        <div className="space-y-4 text-xs text-slate-500 font-medium">
          <p>Rango de precios</p>
          <Button variant="outline" className="w-full h-8 text-[10px]">Limpiar filtros</Button>
        </div>
      </aside>

      {/* LISTA */}
      <main className="flex-1 overflow-y-auto border-r p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{locations.length} inmuebles</h1>
          <p className="text-sm text-slate-500">Cochabamba, Bolivia</p>
        </header>

        <div className="grid gap-4">
          {locations.map((loc) => (
            <PropertyCard
              key={loc.id}
              loc={loc}
              isHovered={hoveredId === loc.id}
              onMouseEnter={() => {
                setHoveredId(loc.id);
                setHoveredPos([loc.lat, loc.lng]);
              }}
              onMouseLeave={() => {
                setHoveredPos(null);
              }}
              onClick={() => setSelectedPos([loc.lat, loc.lng])}
            />
          ))}
        </div>
      </main>

      {/* MAPA (HU2) */}
      <div className="w-[45%] shrink-0 relative">
        <PropertyMap
          locations={locations}
          hoveredId={hoveredId}
          selectedPos={selectedPos}
          hoveredPos={hoveredPos}
          setSelectedPos={setSelectedPos}
        />
      </div>
    </div>
  )
}