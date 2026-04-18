"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
}

export default function LocationDisplay({ lat, lng }: LocationDisplayProps) {
  const position: [number, number] = [lat, lng];

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
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}