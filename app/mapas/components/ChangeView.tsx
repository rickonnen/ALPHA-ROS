// app/mapas/components/ChangeView.tsx
import { useEffect } from "react"
import { useMap } from "react-leaflet"

export default function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, 17, { duration: 1.5 });
  }, [center, map]);
  return null;
}