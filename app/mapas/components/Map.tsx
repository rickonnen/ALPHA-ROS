"use client"
import { useState, useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer, Polyline, Polygon, useMap, useMapEvents } from "react-leaflet"
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

// --- 1. INTERFAZ ACTUALIZADA ---
interface MapProps {
  locations: Location[]
  hoveredId: number | null
  selectedPos: [number, number] | null
  hoveredPos: [number, number] | null
  setSelectedPos: (pos: [number, number]) => void
  isDrawingMode?: boolean;
  drawnPolygon?: [number, number][] | null;
  onPolygonComplete?: (points: [number, number][]) => void;
}

// --- 2. LÓGICA DE DIBUJO ---
function MapDrawingLogic({ 
  isDrawingMode, 
  onPolygonComplete 
}: { 
  isDrawingMode?: boolean, 
  onPolygonComplete?: (pts: [number, number][]) => void 
}) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const map = useMap();

  useEffect(() => {
    if (isDrawingMode) {
      map.dragging.disable();
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = '';
      setPoints([]); 
    }
  }, [isDrawingMode, map]);

  useMapEvents({
    click(e) {
      if (!isDrawingMode || !onPolygonComplete) return;
      
      const newPoints: [number, number][] = [...points, [e.latlng.lat, e.latlng.lng]];
      setPoints(newPoints);

      if (newPoints.length === 4) {
        onPolygonComplete(newPoints);
        setPoints([]); 
      }
    },
  });

  const dotIcon = L.divIcon({ 
    className: 'bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow-md', 
    iconSize: [12, 12] 
  });

  return (
    <>
      {points.map((pt, idx) => <Marker key={`pt-${idx}`} position={pt} icon={dotIcon} interactive={false} />)}
      {points.length > 1 && points.length < 4 && <Polyline positions={points} color="#C26E5A" weight={3} dashArray="5, 10" interactive={false} />}
      {points.length === 4 && <Polygon positions={points} color="#C26E5A" fillOpacity={0.4} interactive={false} />}
    </>
  );
}

// --- 3. COMPONENTE PRINCIPAL ACTUALIZADO ---
export default function PropertyMap({ 
  locations, 
  hoveredId, 
  selectedPos, 
  hoveredPos, 
  setSelectedPos,
  isDrawingMode,
  drawnPolygon,
  onPolygonComplete
}: MapProps) {
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

      {/* HERRAMIENTA DE DIBUJO HU2 */}
      <MapDrawingLogic 
        isDrawingMode={isDrawingMode} 
        onPolygonComplete={onPolygonComplete} 
      />

      {/* ZONA FINAL DIBUJADA HU2 */}
      {drawnPolygon && (
        <Polygon positions={drawnPolygon} color="#2563eb" fillColor="#3b82f6" fillOpacity={0.25} weight={2} />
      )}

      {/* MARCADORES Y CLÚSTERES ORIGINALES */}
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