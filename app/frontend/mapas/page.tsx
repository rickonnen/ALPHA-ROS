"use client"

import { locations, Location } from "@/lib/locations-placeholder-data"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import { useState, useEffect } from "react"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [-17.3943, -66.1569];
const DEFAULT_ZOOM = 15;

const createPriceIcon = (precio: string, isHovered: boolean) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `
      <div class="relative flex flex-col items-center">
        <div class="absolute -top-12 flex flex-col items-center transition-all duration-300 ${isHovered ? 'scale-110 z-50' : 'z-40'}">
          <div class="shadow-xl border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-[12px] 
            ${isHovered ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-900'}">
            ${precio}
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] 
            ${isHovered ? 'border-t-blue-600' : 'border-t-white'}"></div>
        </div>
        <img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png" 
             class="w-[26px] h-[41px] ${isHovered ? 'filter saturate(1.5)' : 'opacity-95'}" />
      </div>`,
    iconSize: [26, 41],
    iconAnchor: [13, 41],
  });
};

const createClusterIcon = (cluster: any) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-11 h-11 bg-blue-600 text-white font-bold rounded-full border-4 border-white shadow-lg text-sm">${cluster.getChildCount()}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(44, 44, true),
  });
};

// --- VERSIÓN SEGURA: SOLO REA-26 Y REA-27 ---
function HoverMapSync({ hoveredId, locations }: any) {
  const map = useMap();

  useEffect(() => {
    if (!hoveredId) return;

    const loc = locations.find((l: any) => l.id === hoveredId);
    if (!loc) return;

    const latLng = L.latLng(loc.lat, loc.lng);

    // REA-27: Si el marcador YA es visible, no hace nada
    if (map.getBounds().contains(latLng)) {
      return; 
    }

    // REA-26: Si NO es visible, centra la cámara
    map.flyTo(latLng, 17, { duration: 1.0 });

  }, [hoveredId, locations, map]);

  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 17, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function FilterAndSearchPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="w-48 shrink-0 border-r p-6 bg-slate-50/50 hidden md:flex flex-col gap-6">
        <h2 className="font-semibold tracking-tight uppercase text-slate-400 text-[10px]">Filtros</h2>
        <div className="space-y-4 text-xs text-slate-500 font-medium">
            <p>Rango de precios</p>
            <Button variant="outline" className="w-full h-8 text-[10px]">Limpiar filtros</Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto border-r p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{locations.length} inmuebles</h1>
          <p className="text-sm text-slate-500">Cochabamba, Bolivia</p>
        </header>

        <div className="grid gap-4">
          {locations.map((loc) => (
            <Card 
              key={loc.id}
              onMouseEnter={() => setHoveredId(loc.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedPos([loc.lat, loc.lng])}
              className={`p-4 transition-all cursor-pointer border-2 shadow-sm
                ${hoveredId === loc.id ? "border-blue-500 bg-blue-50/50" : "border-slate-100"}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                    {loc.zona}
                  </div>
                  <h3 className="text-xl font-medium text-slate-800 tracking-tight">{loc.direccion}</h3>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 tracking-tighter">{loc.precio}</p>
                    <Button variant="link" className="h-auto p-0 text-xs text-slate-400">Detalles</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <div className="w-[45%] shrink-0 relative">
        <Map 
          locations={locations} 
          hoveredId={hoveredId} 
          selectedPos={selectedPos} 
          setSelectedPos={setSelectedPos} 
        />
      </div>
    </div>
  )
}

function Map({ locations, hoveredId, selectedPos, setSelectedPos }: { 
  locations: Location[], 
  hoveredId: number | null,
  selectedPos: [number, number] | null,
  setSelectedPos: (pos: [number, number]) => void
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <div className="h-full bg-slate-50 flex items-center justify-center animate-pulse text-slate-400">Cargando Mapa...</div>;

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
      {selectedPos && <ChangeView center={selectedPos} />}
      
      <HoverMapSync hoveredId={hoveredId} locations={locations} />

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