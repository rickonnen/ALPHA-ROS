'use client';

import dynamic from 'next/dynamic';
import type { Location } from '@/lib/locations';

interface SearchMapClientProps {
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
  onPolygonValidationError?: (message: string) => void;
}

const PropertyMap = dynamic(() => import('@/app/mapas/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
      Cargando mapa...
    </div>
  ),
});

export default function SearchMapClient({
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
  onPolygonValidationError,
}: SearchMapClientProps) {
  return (
    <div className="h-full w-full z-0 relative">
      <PropertyMap
        locations={locations}
        defaultZones={defaultZones}
        drawnZoneSummary={drawnZoneSummary}
        showDefaultZones={showDefaultZones}
        onToggleDefaultZones={onToggleDefaultZones}
        hoveredId={hoveredId}
        selectedPos={selectedPos}
        hoveredPos={hoveredPos}
        setSelectedPos={setSelectedPos}
        isDrawingMode={isDrawingMode}
        drawnPolygon={drawnPolygon}
        onPolygonComplete={onPolygonComplete}
        isEditingPolygon={isEditingPolygon}
        onPolygonEdit={onPolygonEdit}
        onPolygonValidationError={onPolygonValidationError}
      />
    </div>
  );
}
