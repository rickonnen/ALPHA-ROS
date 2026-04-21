"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";

interface MapboxFeature {
  id: string;
  place_name: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (value: string) => void;
}

const SearchAutocomplete = forwardRef<HTMLInputElement, SearchAutocompleteProps>(
  function SearchAutocomplete(
    { value, onChange, onSelectSuggestion },
    ref,
  ) {
    const [sugerencias, setSugerencias] = useState<MapboxFeature[]>([]);
    const [abierto, setAbierto] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(false);
    const [buscado, setBuscado] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setAbierto(false);
          setHighlightedIndex(-1);
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
        setHighlightedIndex(-1);
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
        setHighlightedIndex(features.length > 0 ? 0 : -1);
      } catch {
        setError(true);
        setSugerencias([]);
        setAbierto(true);
        setHighlightedIndex(-1);
      } finally {
        setCargando(false);
      }
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const cleanedValue = event.target.value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]/g,
        "",
      );

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
      setHighlightedIndex(-1);
      onSelectSuggestion?.(feature.place_name);
    };

    const handleClear = () => {
      onChange("");
      setSugerencias([]);
      setAbierto(false);
      setBuscado(false);
      setHighlightedIndex(-1);
      setError(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!abierto && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        if (sugerencias.length > 0 || value.trim()) {
          event.preventDefault();
          setAbierto(true);
          setHighlightedIndex(sugerencias.length > 0 ? 0 : -1);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        if (sugerencias.length === 0) return;
        event.preventDefault();
        setAbierto(true);
        setHighlightedIndex((prev) =>
          prev < sugerencias.length - 1 ? prev + 1 : 0,
        );
      }

      if (event.key === "ArrowUp") {
        if (sugerencias.length === 0) return;
        event.preventDefault();
        setAbierto(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : sugerencias.length - 1,
        );
      }

      if (event.key === "Enter") {
        if (abierto && highlightedIndex >= 0 && sugerencias[highlightedIndex]) {
          event.preventDefault();
          handleSelect(sugerencias[highlightedIndex]);
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handleClear();
      }
    };

    return (
      <div ref={wrapperRef} className="relative mt-3 w-full">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por ubicación"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-expanded={abierto}
            aria-autocomplete="list"
            aria-controls="search-autocomplete-list"
            className="w-full rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 pr-10 text-sm text-[#2E2E2E] shadow-sm outline-none placeholder:text-[#5E5A55]"
          />

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-[#DEDAD3]"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-[#5E5A55]" />
            </button>
          )}
        </div>

        {abierto && (
          <ul
            id="search-autocomplete-list"
            className="absolute top-full z-50 mt-2 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-2 shadow-sm"
          >
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
                No se encontraron ubicaciones
              </li>
            )}

            {!error &&
              !cargando &&
              sugerencias.map((feature, index) => (
                <li
                  key={feature.id}
                  onMouseDown={() => handleSelect(feature)}
                  className={`cursor-pointer rounded-[12px] px-3 py-2 text-sm text-[#2E2E2E] ${
                    highlightedIndex === index
                      ? "bg-[#F4EFE6]"
                      : "hover:bg-[#F4EFE6]"
                  }`}
                >
                  {feature.place_name}
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  },
);

export default SearchAutocomplete;