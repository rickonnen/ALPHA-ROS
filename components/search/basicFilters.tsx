"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import { buscarPublicaciones, type FiltrosPublicacion } from "@/app/frontend/search/search-services";

const geist = Geist({ subsets: ["latin"] });

interface MapboxFeature {
  id: string;
  place_name: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

const TIPOS_INMUEBLE = ["Casa", "Departamento", "Terreno", "Local Comercial", "Oficina"];
const OPERACIONES = ["En venta", "En alquiler", "Anticrético"];

interface Props {
  filtrosAvanzados: { habitaciones: string; banos: string; piscina: string };
  onResultados: (resultados: any[]) => void;
}

export default function FiltrosInmueble({ filtrosAvanzados, onResultados }: Props) {
  const [ubicacion, setUbicacion] = useState("");
  const [sugerencias, setSugerencias] = useState<MapboxFeature[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const [operacion, setOperacion] = useState("En venta");
  const [tipo, setTipo] = useState("");

  const [abiertoOperacion, setAbiertoOperacion] = useState(false);
  const [abiertoTipo, setAbiertoTipo] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setAbiertoOperacion(false);
        setAbiertoTipo(false);
        setIndiceActivo(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const buscar = useCallback(async (query: string) => {
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
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
      );

      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("language", "es");
      url.searchParams.set("limit", "10");
      url.searchParams.set("country", "BO");

      const res = await fetch(url.toString());
      const data = await res.json();

      const features: MapboxFeature[] = data.features ?? [];

      setSugerencias(features);
      setAbierto(true);
      setIndiceActivo(-1);
    } catch {
      setError(true);
      setSugerencias([]);
      setAbierto(true);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]/g, "");
    setUbicacion(val);
    setTimeout(() => buscar(val), 300);
  };

  const handleSelect = (feature: MapboxFeature) => {
    setUbicacion(feature.place_name);
    setSugerencias([]);
    setAbierto(false);
  };

  const handleAplicar = async () => {
    setBuscando(true);
    try {
      const filtros: FiltrosPublicacion = {
        ubicacion,
        operacion,
        tipoInmueble: tipo,
        ...filtrosAvanzados,
      };
      const resultados = await buscarPublicaciones(filtros);
      onResultados(resultados);
    } catch (e) {
      console.error(e);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`${geist.className} bg-[#F4EFE6] border border-[#E7E1D7] rounded-lg p-5 w-72`}
    >
      <h2 className="text-lg font-semibold text-[#2E2E2E]">Filtros</h2>
      <p className="text-xs text-[#2E2E2E]/60 mb-4">Filtros Básicos</p>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por ubicación"
            value={ubicacion}
            onChange={handleChange}
            onFocus={() => {}}
            className="w-full px-3 py-2 border border-[#E7E1D7] rounded-md bg-[#E7E1D7] text-sm outline-none"
          />

          {abierto && (
            <ul className="absolute top-full mt-1 w-full bg-white border border-[#E7E1D7] rounded-md z-50">
              {error && (
                <li className="px-3 py-2 text-sm text-red-500">
                  Error al obtener sugerencias
                </li>
              )}
              {!error && buscado && sugerencias.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">
                  No se encontraron resultados
                </li>
              )}
              {!error &&
                sugerencias.map((feat) => (
                  <li
                    key={feat.id}
                    onMouseDown={() => handleSelect(feat)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-200"
                  >
                    {feat.place_name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setAbiertoOperacion(!abiertoOperacion)}
            className="w-full px-3 py-2 border border-[#E7E1D7] rounded-md bg-[#E7E1D7] text-sm flex justify-between"
          >
            {operacion}
            <span>▾</span>
          </button>

          {abiertoOperacion && (
            <ul className="absolute top-full mt-1 w-full bg-white border border-[#E7E1D7] rounded-md z-50">
              {OPERACIONES.map((op, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setOperacion(op);
                    setAbiertoOperacion(false);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-200"
                >
                  {op}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setAbiertoTipo(!abiertoTipo)}
            className="w-full px-3 py-2 border border-[#E7E1D7] rounded-md bg-[#E7E1D7] text-sm flex justify-between"
          >
            {tipo || "Tipo Inmueble"}
            <span>▾</span>
          </button>

          {abiertoTipo && (
            <ul className="absolute top-full mt-1 w-full bg-white border border-[#E7E1D7] rounded-md z-50">
              {TIPOS_INMUEBLE.map((t, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setTipo(t);
                    setAbiertoTipo(false);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-200"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        onClick={handleAplicar}
        disabled={buscando}
        className="mt-4 w-full py-2 bg-[#1F3A4D] hover:bg-[#C26E5A] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm rounded-md cursor-pointer transition-colors"
      >
        {buscando ? "Buscando..." : "Aplicar filtros"}
      </button>
    </div>
  );
}