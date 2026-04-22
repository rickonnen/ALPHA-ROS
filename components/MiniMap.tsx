"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

interface MiniMapProps {
  coordenadas: [number, number][];
  nombre: string;
}

export default function MiniMap({ coordenadas, nombre }: MiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || coordenadas.length < 3) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    const coords = coordenadas.map(([lng, lat]) => [lng, lat]);
    const closedCoords = [...coords, coords[0]];
    const polygon = turf.polygon([closedCoords]);
    const bbox = turf.bbox(polygon);
    const [minLng, minLat, maxLng, maxLat] = bbox;

    const center: [number, number] = [
      (minLng + maxLng) / 2,
      (minLat + maxLat) / 2,
    ];

    const distance = turf.distance(
      [minLng, minLat],
      [maxLng, maxLat],
      { units: "kilometers" }
    );
    let zoom = 12;
    if (distance > 20) zoom = 10;
    else if (distance > 10) zoom = 11;
    else if (distance < 2) zoom = 14;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: center,
      zoom: zoom,
      interactive: false,
    });

    if (coordenadas.length > 2) {
      map.current.on("load", () => {
        map.current?.addSource("zona", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [...coordenadas.map(([lng, lat]) => [lng, lat]), coordenadas[0]]
              ],
            },
          },
        }); // 👈 aquí estaba el problema, faltaba cerrar addSource

        map.current?.addLayer({
          id: "zona-fill",
          type: "fill",
          source: "zona",
          paint: {
            "fill-color": "#C26E5A",
            "fill-opacity": 0.5,
          },
        });

        map.current?.addLayer({
          id: "zona-outline",
          type: "line",
          source: "zona",
          paint: {
            "line-color": "#8B4423",
            "line-width": 3,
          },
        });

        const points = coordenadas.map(([lng, lat]) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat],
          },
        }));

        map.current?.addSource("zona-puntos", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points as any,
          },
        });

        map.current?.addLayer({
          id: "zona-puntos",
          type: "circle",
          source: "zona-puntos",
          paint: {
            "circle-radius": 6,
            "circle-color": "#C26E5A",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [coordenadas]);

  return (
    <div className="relative w-full h-full">
  <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white border border-slate-700/50">
        {nombre}
      </div>
    </div>
  );
}