"use client"

// TODO: INTEGRACIÓN - Reemplazar este import cuando el equipo de filtros entregue su contexto/hook
// Actualmente se usan datos de prueba. Ver estructura esperada en /lib/locations-placeholder-data.ts
// El equipo de filtros debe proveer un array Location[] con: id, lat, lng, direccion, zona, precio
import { locations, Location } from "@/lib/locations-placeholder-data"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import { useState, useEffect } from "react"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"

// IMPORTACIÓN DE SHADCN
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

// --- ICONOS PERSONALIZADOS HU2 ---
const createPriceIcon = (precio: string, isHovered: boolean) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="
          background: ${isHovered ? '#0f172a' : 'white'};
          color: ${isHovered ? 'white' : '#0f172a'};
          font-weight: 700;
          font-size: 12px;
          font-family: sans-serif;
          padding: 5px 10px;
          border-radius: 20px;
          border: 2px solid ${isHovered ? '#0f172a' : '#e2e8f0'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          white-space: nowrap;
          position: relative;
        ">
          ${precio}
          <div style="
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid ${isHovered ? '#0f172a' : 'white'};
          "></div>
        </div>
        <div style="
          margin-top: 7px;
          width: 8px;
          height: 8px;
          background: ${isHovered ? '#0f172a' : '#94a3b8'};
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "></div>
      </div>`,
    iconSize: [60, 50],
    iconAnchor: [30, 50],
    popupAnchor: [0, -50],
  });
};

const createClusterIcon = (cluster: any) => {
  return L.divIcon({
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: #0f172a;
      color: white;
      font-weight: 700;
      font-size: 14px;
      font-family: sans-serif;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${cluster.getChildCount()}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(44, 44, true),
  });
};

// COMPONENTE PARA MOVER LA CÁMARA
function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    const point = L.latLng(center[0], center[1]);
    if (!map.getBounds().contains(point)) {
      // Si no está visible, vuela a zoom 17 (rompe el cluster)
      map.flyTo(center, 17, { duration: 1.5 });
    } else if (map.getZoom() < 17) {
      // Si está visible pero en cluster, acerca hasta zoom 17
      map.flyTo(center, 17, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function FilterAndSearchPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [hoveredPos, setHoveredPos] = useState<[number, number] | null>(null);
  // TODO: INTEGRACIÓN - Reemplazar 'locations' por los datos del equipo de filtros
  // Ejemplo: const { locations } = useFiltros()
  // o recibir locations como prop desde la página padre
  // La consulta Prisma esperada es:
  // prisma.publicacion.findMany({
  //   select: {
  //     id_publicacion: true,
  //     precio: true,
  //     Ubicacion: { select: { latitud, longitud, direccion, zona } }
  //   }
  // })

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      
      {/* SECCIÓN FILTROS (HU1) */}
      <aside className="w-48 shrink-0 border-r p-6 bg-slate-50/50 hidden md:flex flex-col gap-6">
        <h2 className="font-semibold tracking-tight uppercase text-slate-400 text-[10px]">Filtros</h2>
        <div className="space-y-4 text-xs text-slate-500 font-medium">
            <p>Rango de precios</p>
            <Button variant="outline" className="w-full h-8 text-[10px]">Limpiar filtros</Button>
        </div>
      </aside>

      {/* SECCIÓN LISTA */}
      <main className="flex-1 overflow-y-auto border-r p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{locations.length} inmuebles</h1>
          <p className="text-sm text-slate-500">Cochabamba, Bolivia</p>
        </header>

        <div className="grid gap-4">
          {locations.map((loc) => (
            <Card 
              key={loc.id}
              onMouseEnter={() => {
                  setHoveredId(loc.id);
                  setHoveredPos([loc.lat, loc.lng]);
              }}
              onMouseLeave={() => {
                  setHoveredId(null);
                  setHoveredPos(null); // ← nuevo
              }}
              onClick={() => setSelectedPos([loc.lat, loc.lng])} // Mover al hacer clic en lista
              className={`p-4 transition-all cursor-pointer border-2 shadow-sm
                ${hoveredId === loc.id ? "border-blue-500 bg-blue-50/5" : "border-slate-100"}`}
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

      {/* SECCIÓN MAPA (HU2) */}
      <div className="w-[45%] shrink-0 relative">
        <Map 
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

function Map({ locations, hoveredId, selectedPos, hoveredPos, setSelectedPos }: { 
  locations: Location[], 
  hoveredId: number | null,
  selectedPos: [number, number] | null,
  hoveredPos: [number, number] | null, // ← nuevo
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
      {selectedPos && <ChangeView center={hoveredPos ?? selectedPos} />}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <MarkerClusterGroup disableClusteringAtZoom={17} iconCreateFunction={createClusterIcon}>
        {locations.map((location) => (
          <Marker 
            key={location.id} 
            position={[location.lat, location.lng]}
            icon={createPriceIcon(location.precio, hoveredId === location.id)}
            zIndexOffset={hoveredId === location.id ? 1000 : 0}
            eventHandlers={{
              click: () => setSelectedPos([location.lat, location.lng]) // Mover al hacer clic en globito
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