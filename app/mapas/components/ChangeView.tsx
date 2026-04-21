// app/mapas/components/ChangeView.tsx
import { useEffect } from "react"
import { useMap } from "react-leaflet"

export default function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (!center || !map) return;
    
    // Validar que center tenga valores numéricos válidos
    const [lat, lng] = center;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.warn('ChangeView: Coordenadas inválidas', { lat, lng });
      return;
    }
    
    try {
      map.flyTo(center, 17, { duration: 1.5 });
    } catch (error) {
      console.error("Error al cambiar vista del mapa:", error);
    }
  }, [center, map]);
  
  return null;
}