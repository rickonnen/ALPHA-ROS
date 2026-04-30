"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Square,
  X,
} from "lucide-react";
import type { Location } from "@/lib/locations";
import ChangeView from "./ChangeView";
import {
  createClusterIcon,
  createClusterPopupHTML,
  createPriceIcon,
} from "./icons";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
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

function MarkerPropertyPopup({ location }: { location: Location }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = location.images.length > 0 ? location.images : ["/casa1.jpg"];
  const map = useMap();

  const goToPreviousImage = () => {
    setActiveImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const goToNextImage = () => {
    setActiveImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <div className="relative w-[280px] overflow-hidden rounded-2xl bg-white">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          map.closePopup();
        }}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md transition hover:bg-white hover:text-slate-700"
        aria-label="Cerrar popup"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative h-40 w-full overflow-hidden rounded-b-none rounded-t-2xl bg-slate-100">
        <Image
          src={images[activeImageIndex]}
          alt={`Imagen de ${location.title}`}
          fill
          sizes="280px"
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPreviousImage}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="space-y-3 px-4 pb-4 pt-4">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#8c6c4c]">
            {location.type}
          </p>
          <h3 className="truncate text-base font-semibold text-gray-900">
            {location.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location.location}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-700">
          <div className="flex items-center gap-1.5 truncate">
            <Square className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">
              {location.terrainArea.toLocaleString("es-BO")} m²
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{location.bedrooms} Rec.</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Bath className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{location.bathrooms} Baños</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-center text-xl font-bold leading-tight text-gray-950">
            {location.precio}
          </p>
          <button
            type="button"
            onClick={() =>
              window.open(
                `/publicacion/Vista_del_Inmueble/${location.id}`,
                `tab_mi_inmueble_${location.id}`,
              )
            }
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary)]/90"
          >
            Ver Detalle
          </button>
        </div>
      </div>
    </div>
  );
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
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isDrawingMode) {
      map.dragging.disable();
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = "";
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = window.setTimeout(() => {
        setPoints([]);
        resetTimeoutRef.current = null;
      }, 0);
    }
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
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
      {points.map((point, index) => (
        <Marker
          key={`pt-${index}`}
          position={point}
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-slate-400 animate-pulse">
        Cargando Mapa...
      </div>
    );
  }

  const isValidPos = (pos: [number, number] | null) => {
    if (!pos) return false;
    const [lat, lng] = pos;
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    );
  };

  const validHoveredPos = isValidPos(hoveredPos) ? hoveredPos : null;
  const validSelectedPos = isValidPos(selectedPos) ? selectedPos : null;

  return (
    <>
      <style jsx global>{`
        .property-marker-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 18px;
        }

        .property-marker-popup .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
        }

        .property-marker-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>

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
            clustermouseover: (e: {
              layer: {
                getAllChildMarkers: () => L.Marker[];
                getLatLng: () => L.LatLng;
              };
              target: { _map: L.Map };
            }) => {
              const cluster = e.layer;
              const childMarkers = cluster.getAllChildMarkers();

              const clusterLocations = childMarkers
                .map((marker: L.Marker) => {
                  const pos = marker.getLatLng();
                  return locations.find(
                    (location) =>
                      Math.abs(location.lat - pos.lat) < 0.000001 &&
                      Math.abs(location.lng - pos.lng) < 0.000001,
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
              <Popup
                maxWidth={320}
                minWidth={300}
                closeButton={false}
                className="property-marker-popup"
              >
                <MarkerPropertyPopup location={location} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
}
