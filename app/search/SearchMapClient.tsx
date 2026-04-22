'use client';

import dynamic from 'next/dynamic';
import type { Location } from '@/lib/locations';

const PropertyMap = dynamic(() => import('@/app/mapas/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
      Cargando mapa...
    </div>
  ),
});

interface SearchMapClientProps {
  locations: Location[];
  hoveredId: number | null;
  selectedPos: [number, number] | null;
  hoveredPos: [number, number] | null;
  setSelectedPos: (pos: [number, number]) => void;
  // --- PROPS PARA LA HU2 ---
  isDrawingMode?: boolean;
  drawnPolygon?: [number, number][] | null;
  onPolygonComplete?: (points: [number, number][]) => void;
}

export default function SearchMapClient({
  locations,
  hoveredId,
  selectedPos,
  hoveredPos,
  setSelectedPos,
  isDrawingMode,         // <-- 1. Lo extraemos
  drawnPolygon,          // <-- 1. Lo extraemos
  onPolygonComplete,     // <-- 1. Lo extraemos
}: SearchMapClientProps) {
  return (
    <div className="h-full w-full z-0 relative">
      <PropertyMap
        locations={locations}
        hoveredId={hoveredId}
        selectedPos={selectedPos}
        hoveredPos={hoveredPos}
        setSelectedPos={setSelectedPos}
        isDrawingMode={isDrawingMode}         // <-- 2. Lo pasamos al mapa real
        drawnPolygon={drawnPolygon}           // <-- 2. Lo pasamos al mapa real
        onPolygonComplete={onPolygonComplete} // <-- 2. Lo pasamos al mapa real
      />
    </div>
  );
}
