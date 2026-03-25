"use client"

import { locations, Location } from "@/lib/locations-placeholder-data"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet";

// Configuración de íconos de Leaflet para Next.js
// Soluciona el problema de que los marcadores no se muestran correctamente
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Simulacion de la Página principal de filtrado y búsqueda de propiedades
 * 
 * @description
 * Esta página filtra desde FilterAndSearchPage y los muestra en un mapa interactivo.
 * Los datos de ubicaciones se pasan como prop al componente Map.
 * 
 * @todo Conectar con el estado global/filtros cuando FilterAndSearchPage implemente la lógica
 * @see {@link Map} Componente que renderiza el mapa con los marcadores
 */
export default function FilterAndSearchPage() {
  // Actualmente estamos usando datos de prueba de @/lib/locations-placeholder-data
  // Despues FilterAndSearchPage pasará datos REALES filtrados

  // FilterAndSearchPage debe pasar a Map un array con los datos validados
  // que resulten después de aplicar todos los filtros seleccionados por el usuario.
  return (
    <Map locations={locations} />
  )
}

function Map({ locations }: { locations: Location[] }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <MapContainer
        center={[-17.3943, -66.1569]}
        zoom={15}
        style={{ height: "80%", width: "50%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <strong>{location.direccion}</strong>
              <br />
              Zona: {location.zona}
              <br />
              <small>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
