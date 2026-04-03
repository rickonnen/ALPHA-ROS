"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MapboxFeature {
  id: string;
  place_name: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchAutocomplete({
  value,
  onChange,
}: SearchAutocompleteProps) {
  const [sugerencias, setSugerencias] = useState<MapboxFeature[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const buscarSugerencias = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSugerencias([]);
      setAbierto(false);
      setBuscado(false);
      return;
    }

    setCargando(true);
    setError(false);
    setBuscado(true);

    try {
      const url = new URL(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      );

      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("language", "es");
      url.searchParams.set("limit", "10");
      url.searchParams.set("country", "BO");

      const response = await fetch(url.toString());
      const data = await response.json();
      const features: MapboxFeature[] = data.features ?? [];

      setSugerencias(features);
      setAbierto(true);
    } catch {
      setError(true);
      setSugerencias([]);
      setAbierto(true);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]/g, "");
    onChange(cleanedValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void buscarSugerencias(cleanedValue);
    }, 300);
  };

  const handleSelect = (feature: MapboxFeature) => {
    onChange(feature.place_name);
    setSugerencias([]);
    setAbierto(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full mt-3">
      <input
        type="text"
        placeholder="Buscar por ubicación"
        value={value}
        onChange={handleChange}
        className="w-full rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#5E5A55] shadow-sm"
      />

      {abierto && (
        <ul className="absolute top-full z-50 mt-2 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-2 shadow-sm">
          {cargando && (
            <li className="px-3 py-2 text-sm text-gray-500">
              Buscando ubicaciones...
            </li>
          )}
          {error && !cargando && (
            <li className="px-3 py-2 text-sm text-red-500">
              Error al obtener sugerencias
            </li>
          )}
          {!error && !cargando && buscado && sugerencias.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">
              No se encontraron resultados
            </li>
          )}
          {!error &&
            !cargando &&
            sugerencias.map((feature) => (
              <li
                key={feature.id}
                onMouseDown={() => handleSelect(feature)}
                className="cursor-pointer rounded-[12px] px-3 py-2 text-sm text-[#2E2E2E] hover:bg-[#F4EFE6]"
              >
                {feature.place_name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}