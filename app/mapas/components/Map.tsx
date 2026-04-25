"use client";
import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/lib/locations";
import ChangeView from "./ChangeView";
import {
  createPriceIcon,
  createClusterIcon,
  createClusterPopupHTML,
} from "./icons";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [-17.3943, -66.1569];
const DEFAULT_ZOOM = 15;

interface MapProps {
  locations: Location[];
  hoveredId: number | null;
  selectedPos: [number, number] | null;
  hoveredPos: [number, number] | null;
  setSelectedPos: (pos: [number, number]) => void;
  isDrawingMode?: boolean;
  drawnPolygon?: [number, number][] | null;
  onPolygonComplete?: (points: [number, number][]) => void;
}

// Agrega este componente arriba, junto a MapDrawingLogic
function MapEventHandler({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function MapDrawingLogic({
  isDrawingMode,
  onPolygonComplete,
}: {
  isDrawingMode?: boolean;
  onPolygonComplete?: (pts: [number, number][]) => void;
}) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const map = useMap();

  useEffect(() => {
    if (isDrawingMode) {
      map.dragging.disable();
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = "";
      setPoints([]);
    }
  }, [isDrawingMode, map]);

  useMapEvents({
    click(e) {
      if (!isDrawingMode || !onPolygonComplete) return;
      const newPoints: [number, number][] = [
        ...points,
        [e.latlng.lat, e.latlng.lng],
      ];
      setPoints(newPoints);
      if (newPoints.length === 4) {
        onPolygonComplete(newPoints);
        setPoints([]);
      }
    },
  });

  const dotIcon = L.divIcon({
    className:
      "bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow-md",
    iconSize: [12, 12],
  });

  return (
    <>
      {points.map((pt, idx) => (
        <Marker
          key={`pt-${idx}`}
          position={pt}
          icon={dotIcon}
          interactive={false}
        />
      ))}
      {points.length > 1 && points.length < 4 && (
        <Polyline
          positions={points}
          color="#C26E5A"
          weight={3}
          dashArray="5, 10"
          interactive={false}
        />
      )}
      {points.length === 4 && (
        <Polygon
          positions={points}
          color="#C26E5A"
          fillOpacity={0.4}
          interactive={false}
        />
      )}
    </>
  );
}

export default function PropertyMap({
  locations,
  hoveredId,
  selectedPos,
  hoveredPos,
  setSelectedPos,
  isDrawingMode,
  drawnPolygon,
  onPolygonComplete,
}: MapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const popupRef = useRef<L.Popup | null>(null);

  const closePopup = () => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading)
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center animate-pulse text-slate-400">
        Cargando Mapa...
      </div>
    );

  // Validar que hoveredPos y selectedPos tengan coordenadas válidas
  const isValidPos = (pos: [number, number] | null) => {
    if (!pos) return false;
    const [lat, lng] = pos;
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  };

  const validHoveredPos = isValidPos(hoveredPos) ? hoveredPos : null;
  const validSelectedPos = isValidPos(selectedPos) ? selectedPos : null;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
    >
      {validHoveredPos && <ChangeView center={validHoveredPos} />}
      {!validHoveredPos && validSelectedPos && (
        <ChangeView center={validSelectedPos} />
      )}

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapDrawingLogic
        isDrawingMode={isDrawingMode}
        onPolygonComplete={onPolygonComplete}
      />

      {drawnPolygon && (
        <Polygon
          positions={drawnPolygon}
          color="#8B4423"
          fillColor="#C26E5A"
          fillOpacity={0.25}
          weight={2}
        />
      )}

      <MarkerClusterGroup
        disableClusteringAtZoom={17}
        spiderfyOnMaxZoom={false}
        showCoverageOnHover={false}
        iconCreateFunction={createClusterIcon}
        eventHandlers={{
          clustermouseover: (e: any) => {
            const cluster = e.layer;
            const childMarkers = cluster.getAllChildMarkers();

            const clusterLocations = childMarkers
              .map((marker: L.Marker) => {
                const pos = marker.getLatLng();
                return locations.find(
                  (loc) =>
                    Math.abs(loc.lat - pos.lat) < 0.000001 &&
                    Math.abs(loc.lng - pos.lng) < 0.000001,
                );
              })
              .filter(Boolean) as Location[];

            if (clusterLocations.length === 0) return;

            closePopup();

            const popup = L.popup({
              closeButton: false,
              autoClose: false,
              closeOnClick: false,
              offset: [0, -10],
            })
              .setLatLng(cluster.getLatLng())
              .setContent(createClusterPopupHTML(clusterLocations))
              .openOn(e.target._map);

            popupRef.current = popup;
          },
          clustermouseout: closePopup,
          animationend: closePopup,
        }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createPriceIcon(location.precio, hoveredId === location.id)}
            zIndexOffset={hoveredId === location.id ? 1000 : 0}
            eventHandlers={{
              click: () => setSelectedPos([location.lat, location.lng]),
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="text-sm font-bold text-slate-900">
                  {location.direccion}
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {location.precio}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
