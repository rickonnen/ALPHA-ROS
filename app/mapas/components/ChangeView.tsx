// app/mapas/components/ChangeView.tsx
import { useEffect } from "react"
import { useMap } from "react-leaflet"

export default function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (!center || !map) return;
    
    const [lat, lng] = center;
    if (
      typeof lat !== 'number' || typeof lng !== 'number' ||
      isNaN(lat) || isNaN(lng) ||
      !isFinite(lat) || !isFinite(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      console.warn('ChangeView: Coordenadas inválidas', { lat, lng });
      return;
    }

    try {
      map.setView([lat, lng], 17);
    } catch (error) {
      console.error("Error al cambiar vista del mapa:", error);
    }
  }, [center, map]);
  
  return null;
}