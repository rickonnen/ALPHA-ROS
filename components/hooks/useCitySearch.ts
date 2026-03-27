/**
 * Dev: Neil Andres Lafuente Zurita    Fecha: 27/03/2026
 * Funcionalidad: Panel del Filtro con búsqueda predictiva Mapbox y cierre externo.
 */
import { useState, useRef } from "react";

// Acceso a variables de entorno de Next.js
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const BOLIVIA_BBOX = "-69.64,-22.90,-57.45,-9.66";
const STR_FLAG_URL = "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774580367/flag-for-flag-bolivia-svgrepo-com_xemt7m.svg";

export function useCitySearch() {
  const [strCiudad, setStrCiudad] = useState("");
  const [arrSuggestions, setArrSuggestions] = useState<any[]>([]);
  const [bolShowSuggestions, setBolShowSuggestions] = useState(false);
  const [bolNoResults, setBolNoResults] = useState(false);
  const [intSelectedIndex, setIntSelectedIndex] = useState(-1);
  const objSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizeText = (val: string) => 
    val.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2 || !MAPBOX_TOKEN) return;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?bbox=${BOLIVIA_BBOX}&types=region,district,place,locality&limit=10&language=es&access_token=${MAPBOX_TOKEN}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      const boliviaResults = (data.features || []).filter((f: any) => 
        f.place_name.toLowerCase().includes("bolivia")
      );
      
      const unique = Array.from(new Map(boliviaResults.map((f: any) => [
        normalizeText(f.text), 
        { 
          strId: f.id, 
          strName: f.text.replace(/Departamento de |Provincia /gi, ""), 
          strFullName: f.place_name,
          strIcon: STR_FLAG_URL 
        }
      ])).values());

      setArrSuggestions(unique.slice(0, 5));
      setBolShowSuggestions(unique.length > 0);
      setBolNoResults(unique.length === 0);
    } catch (e) {
      console.error("Search Error:", e);
      setBolNoResults(true);
    }
  };

  const handleCityChange = (val: string) => {
    setStrCiudad(val);
    if (objSearchTimeoutRef.current) clearTimeout(objSearchTimeoutRef.current);
    if (val.length < 2) {
      setArrSuggestions([]);
      setBolShowSuggestions(false);
      setBolNoResults(false);
      return;
    }
    objSearchTimeoutRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  return {
    strCiudad, setStrCiudad,
    arrSuggestions, setArrSuggestions,
    bolShowSuggestions, setBolShowSuggestions,
    bolNoResults, setBolNoResults,
    intSelectedIndex, setIntSelectedIndex,
    handleCityChange
  };
}