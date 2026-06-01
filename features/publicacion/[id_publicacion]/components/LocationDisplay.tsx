/**
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Componente de cliente que renderiza un mapa interactivo utilizando React Leaflet. Recibe coordenadas geográficas para centrar la vista y colocar un marcador exacto. Incluye un parche para la carga de íconos por defecto en Next.js y configuraciones de UX (bloqueo de scroll de rueda) para no interrumpir la navegación por la página.
 * @param {number} lat - Coordenada de latitud de la ubicación del inmueble.
 * @param {number} lng - Coordenada de longitud de la ubicación del inmueble.
 * @return {JSX.Element} Contenedor estilizado con el mapa interactivo de OpenStreetMap.
 */
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  createPoiLeafletIcon,
  createPropertyLeafletIcon,
} from "@/lib/pointOfInterestIcons";
// Arreglo para los íconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
interface LocationDisplayProps {
  lat: number;
  lng: number;
  puntosInteres?: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    lat: number;
    lng: number;
    distancia_metros?: number | null;
    tipo_nombre?: string | null;
    tipo_color?: string | null;
  }[];
}

function formatDistance(distance?: number | null) {
  if (typeof distance !== "number" || Number.isNaN(distance)) return null;
  if (distance < 1000) return `${distance} m`;
  return `${(distance / 1000).toFixed(1)} km`;
}

export default function LocationDisplay({
  lat,
  lng,
  puntosInteres = [],
}: LocationDisplayProps) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-3xl border border-black/5 bg-slate-100 text-slate-500 md:h-[350px]">
        Ubicación exacta en el mapa no disponible.
      </div>
    );
  }

  const position: [number, number] = [lat, lng];
  const validPoints = puntosInteres.filter(
    (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng),
  );

  return (
    // Contenedor con bordes redondeados adaptado a tu mockup
    <div className="h-[280px] md:h-[350px] w-full rounded-3xl overflow-hidden border border-black/5 shadow-sm relative z-0">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false} // Evita que la página haga scroll accidentalmente al pasar el mouse
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={createPropertyLeafletIcon()}>
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#1F3A4D]">Ubicación de la propiedad</p>
              <p className="text-xs text-slate-500">
                Punto principal del inmueble publicado.
              </p>
            </div>
          </Popup>
        </Marker>
        {validPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createPoiLeafletIcon({
              icon: point.tipo_nombre,
              color: point.tipo_color || "#C26E5A",
              tipoNombre: point.tipo_nombre,
            })}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1F3A4D]">
                  {point.nombre}
                </p>
                {point.tipo_nombre && (
                  <p className="text-xs font-medium text-[#C26E5A]">
                    {point.tipo_nombre}
                  </p>
                )}
                {point.descripcion && (
                  <p className="text-xs text-slate-600">{point.descripcion}</p>
                )}
                {formatDistance(point.distancia_metros) && (
                  <p className="text-xs text-slate-500">
                    Aprox. a {formatDistance(point.distancia_metros)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
