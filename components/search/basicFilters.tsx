"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import { buscarPublicaciones, type FiltrosPublicacion } from "@/app/frontend/search/search-services";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]/g, "");
    setUbicacion(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(val), 400);
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
      className={`${geist.className} w-full`}
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por ubicación"
            value={ubicacion}
            onChange={handleChange}
            className="w-full rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#5E5A55]"
          />

          {abierto && (
            <ul className="absolute top-full z-50 mt-2 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-2 shadow-sm">
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
                    className="cursor-pointer rounded-[12px] px-3 py-2 text-sm text-[#2E2E2E] hover:bg-[#F4EFE6]"
                  >
                    {feat.place_name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <Accordion
          type="single"
          collapsible
          value={abiertoOperacion ? "operacion" : ""}
          onValueChange={(value) => setAbiertoOperacion(value === "operacion")}
          className="w-full"
        >
          <AccordionItem value="operacion" className="border-none">
            <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
              <AccordionTrigger
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                  "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
                )}
              >
                {operacion}
              </AccordionTrigger>
            </div>

            <AccordionContent className="pt-3 pb-0">
              <div className="w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
                <div className="space-y-2">
                  {OPERACIONES.map((op, i) => {
                    const checked = op === operacion;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setOperacion(op);
                          setAbiertoOperacion(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm text-[#2E2E2E] transition",
                          checked ? "bg-[#E7E3DD]" : "bg-transparent hover:bg-[#F4EFE6]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition",
                            checked ? "border-[#6B6B6B] bg-white" : "border-[#8A847C] bg-white"
                          )}
                        >
                          <span
                            className={cn(
                              "h-[8px] w-[8px] rounded-full bg-[#1F3A4D] transition",
                              checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                            )}
                          />
                        </span>
                        <span className="text-sm text-[#2E2E2E]">{op}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion
          type="single"
          collapsible
          value={abiertoTipo ? "tipo" : ""}
          onValueChange={(value) => setAbiertoTipo(value === "tipo")}
          className="w-full"
        >
          <AccordionItem value="tipo" className="border-none">
            <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
              <AccordionTrigger
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                  "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
                )}
              >
                {tipo || "Tipo Inmueble"}
              </AccordionTrigger>
            </div>

            <AccordionContent className="pt-3 pb-0">
              <div className="w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
                <div className="space-y-2">
                  {TIPOS_INMUEBLE.map((t, i) => {
                    const checked = t === tipo;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setTipo(t);
                          setAbiertoTipo(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm text-[#2E2E2E] transition",
                          checked ? "bg-[#E7E3DD]" : "bg-transparent hover:bg-[#F4EFE6]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition",
                            checked ? "border-[#6B6B6B] bg-white" : "border-[#8A847C] bg-white"
                          )}
                        >
                          <span
                            className={cn(
                              "h-[8px] w-[8px] rounded-full bg-[#1F3A4D] transition",
                              checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                            )}
                          />
                        </span>
                        <span className="text-sm text-[#2E2E2E]">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}