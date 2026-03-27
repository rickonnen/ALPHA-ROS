"use client"

import { locations, Location } from "@/lib/locations-placeholder-data"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet";
import { useState, useEffect } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [-17.3943, -66.1569];
const DEFAULT_ZOOM = 15;

function getInitialCenter(locations: Location[]): [number, number] {
  if (locations.length > 0) return [locations[0].lat, locations[0].lng];
  return DEFAULT_CENTER;
}

export default function FilterAndSearchPage() {
  return (
    // Layout de 3 columnas como el mockup
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* Columna izquierda — Filtros */}
      <aside className="w-48 shrink-0 border-r p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-sm">Filtros de Búsqueda</h2>
        {/* Aquí irán los filtros reales cuando estén listos */}
        <div className="text-xs text-gray-400">Min / Max, Tipo, Zona...</div>
      </aside>

      {/* Columna central — Lista de inmuebles */}
      <main className="flex-1 overflow-y-auto border-r p-4">
        <p className="text-sm text-gray-500 mb-3">
          {locations.length} inmuebles encontrados
        </p>
        {locations.map((loc) => (
          <div key={loc.id} className="border rounded p-3 mb-3 text-sm">
            <p className="font-medium">{loc.direccion}</p>
            <p className="text-gray-500">{loc.zona}</p>
          </div>
        ))}
      </main>

      {/* Columna derecha — Mapa */}
      <div className="w-[45%] shrink-0">
        <Map locations={locations} />
      </div>

    </div>
  )
}

function Map({ locations }: { locations: Location[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500 p-8">
          <p className="text-lg font-medium">No se pudo cargar el mapa</p>
          <p className="text-sm mt-1">Verifica tu conexión e intenta nuevamente.</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => setMapError(false)}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3" />
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={getInitialCenter(locations)}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        eventHandlers={{ tileerror: () => setMapError(true) }}
      />
      {locations.map((location) => (
        <Marker key={location.id} position={[location.lat, location.lng]}>
          <Popup>
            <strong>{location.direccion}</strong><br />
            Zona: {location.zona}<br />
            <small>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</small>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}