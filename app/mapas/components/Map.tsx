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
  Tooltip,
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
  Eye,
  EyeOff,
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
  defaultZones?: {
    id_zona: number;
    nombre_zona: string;
    coordenadas: [number, number][];
    stats: {
      propertyCount: number;
      averagePriceLabel: string | null;
    };
  }[];
  drawnZoneSummary?: {
    nombre: string;
    stats: {
      propertyCount: number;
      averagePriceLabel: string | null;
    };
  } | null;
  showDefaultZones?: boolean;
  onToggleDefaultZones?: (nextValue: boolean) => void;
  hoveredId: number | null;
  selectedPos: [number, number] | null;
  hoveredPos: [number, number] | null;
  setSelectedPos: (pos: [number, number]) => void;
  isDrawingMode?: boolean;
  drawnPolygon?: [number, number][] | null;
  onPolygonComplete?: (points: [number, number][]) => void;
  isEditingPolygon?: boolean;
  onPolygonEdit?: (points: [number, number][]) => void;
}

const MIN_POLYGON_POINTS = 4;
const MAX_POLYGON_POINTS = 10;

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
          <div className="mt-3 space-y-2">

                <button
                  type="button"
                  onClick={() => {
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;

                    window.open(
                      googleMapsUrl,
                      "_blank"
                    );
                  }}
                 className="flex w-full items-center justify-center rounded-lg bg-[#c26e5a] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                Cómo llegar
            </button>

                 <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `/publicacion/Vista_del_Inmueble/${location.id}`,
                      `tab_mi_inmueble_${location.id}`,
                    )
                  }
                  className="flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary)]/90"
                >
                  Ver Detalle
                </button>

          </div>
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
      map.doubleClickZoom.disable();
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
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
      map.doubleClickZoom.enable();
      map.getContainer().style.cursor = "";
    };
  }, [isDrawingMode, map]);

  useMapEvents({
    click(e) {
      if (!isDrawingMode || !onPolygonComplete) return;
      if ((e.originalEvent as MouseEvent | undefined)?.detail === 2) return;

      if (points.length >= MAX_POLYGON_POINTS) {
        onPolygonComplete(points);
        setPoints([]);
        return;
      }

      if (points.length >= MIN_POLYGON_POINTS) {
        const firstPoint = L.latLng(points[0][0], points[0][1]);
        const firstPointPixel = map.latLngToContainerPoint(firstPoint);
        const clickedPointPixel = map.latLngToContainerPoint(e.latlng);

        if (firstPointPixel.distanceTo(clickedPointPixel) <= 14) {
          onPolygonComplete(points);
          setPoints([]);
          return;
        }
      }

      const newPoints: [number, number][] = [
        ...points,
        [e.latlng.lat, e.latlng.lng],
      ];

      setPoints(newPoints);

      if (newPoints.length === MAX_POLYGON_POINTS) {
        onPolygonComplete(newPoints);
        setPoints([]);
      }
    },
    dblclick() {
      if (!isDrawingMode || !onPolygonComplete) return;
      if (points.length < MIN_POLYGON_POINTS) return;
      onPolygonComplete(points);
      setPoints([]);
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
      {points.length > 1 && points.length < MAX_POLYGON_POINTS && (
        <Polyline
          positions={points}
          color="#C26E5A"
          weight={3}
          dashArray="5, 10"
          interactive={false}
        />
      )}
      {points.length >= MIN_POLYGON_POINTS && (
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
  defaultZones = [],
  drawnZoneSummary = null,
  showDefaultZones = true,
  onToggleDefaultZones,
  hoveredId,
  selectedPos,
  hoveredPos,
  setSelectedPos,
  isDrawingMode,
  drawnPolygon,
  onPolygonComplete,
  isEditingPolygon,
  onPolygonEdit,
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
  const editPointIcon = L.divIcon({
    className:
      "flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#8B4423] shadow-md",
    iconSize: [16, 16],
  });

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

        .default-zones-toggle {
          position: absolute;
          left: 10px;
          top: 90px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
        }

        .default-zones-toggle__button {
          display: flex;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #475569;
          transition:
            background-color 0.2s ease,
            color 0.2s ease;
        }

        .default-zones-toggle__button + .default-zones-toggle__button {
          border-top: 1px solid rgba(148, 163, 184, 0.2);
        }

        .default-zones-toggle__button:hover {
          background: rgba(31, 58, 77, 0.08);
          color: #1f3a4d;
        }

        .default-zones-toggle__button--active {
          background: #1f3a4d;
          color: #f8fafc;
        }

        .default-zone-label {
          border: none;
          background: rgba(31, 58, 77, 0.9);
          color: #f8fafc;
          border-radius: 999px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.2);
          padding: 0;
        }

        .default-zone-label .leaflet-tooltip-content {
          margin: 0;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .user-zone-label {
          border: none;
          background: rgba(194, 110, 90, 0.92);
          color: #fffaf7;
          border-radius: 999px;
          box-shadow: 0 6px 18px rgba(139, 68, 35, 0.25);
          padding: 0;
        }

        .user-zone-label .leaflet-tooltip-content {
          margin: 0;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
      `}</style>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
      >
        {defaultZones.length > 0 && (
          <div className="default-zones-toggle">
            <button
              type="button"
              className={`default-zones-toggle__button ${
                showDefaultZones ? "default-zones-toggle__button--active" : ""
              }`}
              aria-label="Mostrar zonas predeterminadas"
              title="Mostrar zonas predeterminadas"
              onClick={() => onToggleDefaultZones?.(true)}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`default-zones-toggle__button ${
                !showDefaultZones ? "default-zones-toggle__button--active" : ""
              }`}
              aria-label="Ocultar zonas predeterminadas"
              title="Ocultar zonas predeterminadas"
              onClick={() => onToggleDefaultZones?.(false)}
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        )}

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
          >
            {drawnZoneSummary && (
              <>
                <Tooltip
                  permanent
                  direction="center"
                  className="user-zone-label"
                >
                  {drawnZoneSummary.nombre}
                </Tooltip>
                <Popup>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#8B4423]">
                      {drawnZoneSummary.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {drawnZoneSummary.stats.propertyCount} inmuebles con los filtros actuales
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {drawnZoneSummary.stats.averagePriceLabel
                        ? `Promedio: ${drawnZoneSummary.stats.averagePriceLabel}`
                        : "Sin datos de precio para calcular promedio"}
                    </p>
                  </div>
                </Popup>
              </>
            )}
          </Polygon>
        )}

        {showDefaultZones &&
          defaultZones.map((zone) => (
            <Polygon
              key={`default-zone-${zone.id_zona}`}
              positions={zone.coordenadas}
              color="#1F3A4D"
              fillColor="#3E6B87"
              fillOpacity={0.16}
              weight={2}
            >
              <Tooltip
                permanent
                direction="center"
                className="default-zone-label"
              >
                {zone.nombre_zona}
              </Tooltip>
              <Popup>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1F3A4D]">
                    {zone.nombre_zona}
                  </p>
                  <p className="text-xs text-slate-500">
                    Zona predeterminada del sitio
                  </p>
                  <p className="text-xs text-slate-500">
                    {zone.stats.propertyCount} inmuebles con los filtros actuales
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {zone.stats.averagePriceLabel
                      ? `Promedio: ${zone.stats.averagePriceLabel}`
                      : "Sin datos de precio para calcular promedio"}
                  </p>
                </div>
              </Popup>
            </Polygon>
          ))}

        {isEditingPolygon &&
          drawnPolygon?.map((point, index) => (
            <Marker
              key={`edit-point-${index}`}
              position={point}
              icon={editPointIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  if (!onPolygonEdit || !drawnPolygon) return;
                  const marker = event.target as L.Marker;
                  const { lat, lng } = marker.getLatLng();
                  const updatedPolygon = drawnPolygon.map((currentPoint, currentIndex) =>
                    currentIndex === index ? [lat, lng] : currentPoint,
                  ) as [number, number][];
                  onPolygonEdit(updatedPolygon);
                },
              }}
            />
          ))}

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
