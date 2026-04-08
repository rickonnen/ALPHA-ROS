// app/mapas/components/Map.tsx
"use client"
import { useState, useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Location } from "@/lib/locations"
import ChangeView from "./ChangeView"
import { createPriceIcon, createClusterIcon } from "./icons"

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [-17.3943, -66.1569];
const DEFAULT_ZOOM = 15;

interface MapProps {
  locations: Location[]
  hoveredId: number | null
  selectedPos: [number, number] | null
  hoveredPos: [number, number] | null
  setSelectedPos: (pos: [number, number]) => void
}

export default function PropertyMap({ locations, hoveredId, selectedPos, hoveredPos, setSelectedPos }: MapProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return (
    <div className="h-full bg-slate-50 flex items-center justify-center animate-pulse text-slate-400">
      Cargando Mapa...
    </div>
  );

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
      {(hoveredPos ?? selectedPos) && <ChangeView center={hoveredPos ?? selectedPos} />}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MarkerClusterGroup disableClusteringAtZoom={17} iconCreateFunction={createClusterIcon}>
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createPriceIcon(location.precio, hoveredId === location.id)}
            zIndexOffset={hoveredId === location.id ? 1000 : 0}
            eventHandlers={{
              click: () => setSelectedPos([location.lat, location.lng])
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="text-sm font-bold text-slate-900">{location.direccion}</p>
                <p className="text-sm font-bold text-blue-600">{location.precio}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}