'use client';

import PropertyMap from '@/app/mapas/components/Map';
import type { Location } from '@/lib/locations';

interface SearchMapClientProps {
  locations: Location[];
  hoveredId: number | null;
  selectedPos: [number, number] | null;
  hoveredPos: [number, number] | null;
  setSelectedPos: (pos: [number, number]) => void;
}

export default function SearchMapClient({
  locations,
  hoveredId,
  selectedPos,
  hoveredPos,
  setSelectedPos,
}: SearchMapClientProps) {
  return (
    <div className="h-full w-full">
      <PropertyMap
        locations={locations}
        hoveredId={hoveredId}
        selectedPos={selectedPos}
        hoveredPos={hoveredPos}
        setSelectedPos={setSelectedPos}
      />
    </div>
  );
}
