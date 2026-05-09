"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Geist } from "next/font/google";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import SurfaceRangeDropdown from "./surfaceRangeDropdown";

const geist = Geist({ subsets: ["latin"] });

const HABITACIONES = [
  "Sin ambientes",
  "+1 ambientes",
  "+2 ambientes",
  "+3 ambientes",
  "+4 ambientes",
];

const BANOS = ["+1 baños", "+2 baños", "+3 baños", "+4 baños"];

const PISCINA = ["Sí", "No"];

interface SubDropdownProps {
  label: string;
  opciones?: string[];
  valor?: string;
  onChange?: (v: string) => void;
  mostrarLabelConValor?: boolean;
}

function SubDropdown({
  label,
  opciones = [],
  valor = "",
  onChange,
  mostrarLabelConValor = false,
}: SubDropdownProps) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    if (abierto && opciones.length > 0) {
      requestAnimationFrame(() => {
        optionRefs.current[0]?.focus();
      });
    }
  }, [abierto, opciones.length]);

  const getButtonLabel = () => {
    if (!valor) return label;

    if (mostrarLabelConValor) {
      return `${label}: ${valor}`;
    }

    return valor;
  };

  const clearValue = () => {
    onChange?.("");
    setAbierto(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setAbierto((prev) => !prev);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    optionValue: string
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % opciones.length;
      optionRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = (index - 1 + opciones.length) % opciones.length;
      optionRefs.current[prevIndex]?.focus();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange?.(optionValue);
      setAbierto(false);

      requestAnimationFrame(() => {
        triggerButtonRef.current?.focus();
      });
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);

      requestAnimationFrame(() => {
        triggerButtonRef.current?.focus();
      });
    }
  };

  return (
    <div ref={ref} className="w-full">
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="flex w-full items-center justify-between rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] shadow-sm transition-colors hover:bg-[#DDD7CD] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2"
      >
        <span className="text-[#2E2E2E]">{getButtonLabel()}</span>

        <div className="flex items-center gap-2">
          {valor && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Limpiar ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                clearValue();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  clearValue();
                }
              }}
              className="flex cursor-pointer items-center justify-center rounded-full p-1 transition-colors hover:bg-[#DEDAD3]"
            >
              <X className="h-4 w-4 text-[#5E5A55]" />
            </span>
          )}

          <span
            className="text-[#4B4B4B] transition-transform duration-200"
            style={{
              display: "inline-block",
              transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {abierto && (
        <div className="mt-3 w-full rounded-lg border border-[#C8C0B5] bg-white p-3 shadow-sm">
          <div className="space-y-2">
            {opciones.map((op, index) => {
              const checked = valor === op;

              return (
                <button
                  key={op}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange?.(op);
                    setAbierto(false);
                  }}
                  onKeyDown={(event) => handleOptionKeyDown(event, index, op)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm outline-none transition",
                    "focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2",
                    checked
                      ? "bg-[#E7E3DD] text-[#2E2E2E]"
                      : "bg-transparent text-[#2E2E2E] hover:bg-[#F4EFE6]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] items-center justify-center rounded-lg border transition",
                      checked
                        ? "border-[#6B6B6B] bg-white"
                        : "border-[#8A847C] bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "h-[8px] w-[8px] rounded-lg bg-[#1F3A4D] transition",
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
      )}
    </div>
  );
}

interface AdvancedFiltersValues {
  habitaciones?: string;   // <--- AGREGÁ EL ?
  banos?: string;          // <--- AGREGÁ EL ?
  piscina?: string;        // <--- AGREGÁ EL ?
  minSurface?: number;     
  maxSurface?: number;     
  etiquetasIds?: number[]; // <--- AGREGÁ EL ?
}

interface Props {
  onChange: (valores: AdvancedFiltersValues) => void;
  value?: AdvancedFiltersValues;
  allTags: any[];
}

export default function FiltrosAvanzado({ onChange, value, allTags }: Props) {
  const [abierto, setAbierto] = useState(false);

  const [habitaciones, setHabitaciones] = useState(value?.habitaciones ?? "");
  const [banos, setBanos] = useState(value?.banos ?? "");
  const [piscina, setPiscina] = useState(value?.piscina ?? "");
  
  // Manejamos localmente como string para el input, pero convertimos al enviar
  const [minSurface, setMinSurface] = useState(value?.minSurface?.toString() ?? "");
  const [maxSurface, setMaxSurface] = useState(value?.maxSurface?.toString() ?? "");
  const [surfaceError, setSurfaceError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHabitaciones(value?.habitaciones ?? "");
    setBanos(value?.banos ?? "");
    setPiscina(value?.piscina ?? "");
    setMinSurface(value?.minSurface?.toString() ?? "");
    setMaxSurface(value?.maxSurface?.toString() ?? "");
  }, [
    value?.habitaciones,
    value?.banos,
    value?.piscina,
    value?.minSurface,
    value?.maxSurface,
  ]);

  const actualizar = (
    campo: "habitaciones" | "banos" | "piscina" | "minSurface" | "maxSurface",
    nuevoValor: string
  ) => {
    const parseSurface = (val: string) => val === "" ? undefined : Number(val);

    onChange({
      habitaciones: campo === "habitaciones" ? nuevoValor : habitaciones,
      banos: campo === "banos" ? nuevoValor : banos,
      piscina: campo === "piscina" ? nuevoValor : piscina,
      minSurface: campo === "minSurface" ? parseSurface(nuevoValor) : parseSurface(minSurface),
      maxSurface: campo === "maxSurface" ? parseSurface(nuevoValor) : parseSurface(maxSurface),
      etiquetasIds: value?.etiquetasIds ?? [],
    });
  };

  const handleSurfaceInputChange =
    (field: "minSurface" | "maxSurface") => (rawValue: string) => {
      const inputValue = rawValue.trim();

      if (inputValue === "") {
        setSurfaceError(null);
        if (field === "minSurface") {
          setMinSurface("");
          actualizar("minSurface", "");
        } else {
          setMaxSurface("");
          actualizar("maxSurface", "");
        }
        return;
      }

      const validSurface = /^\d*\.?\d*$/.test(inputValue);
      if (!validSurface) {
        setSurfaceError("Solo se permiten números");
        return;
      }

      setSurfaceError(null);
      if (field === "minSurface") {
        setMinSurface(inputValue);
        actualizar("minSurface", inputValue);
      } else {
        setMaxSurface(inputValue);
        actualizar("maxSurface", inputValue);
      }
    };

  const clearSurfaceRange = () => {
    setSurfaceError(null);
    setMinSurface("");
    setMaxSurface("");
    onChange({
      habitaciones,
      banos,
      piscina,
      minSurface: undefined,
      maxSurface: undefined,
      etiquetasIds: value?.etiquetasIds ?? [],
    });
  };

  const toggleTag = (id: number) => {
    const actuales = value?.etiquetasIds ?? [];
    const nuevos = actuales.includes(id)
      ? actuales.filter((t) => t !== id)
      : [...actuales, id];

    const parseSurface = (val: string) => val === "" ? undefined : Number(val);

    onChange({
      habitaciones,
      banos,
      piscina,
      minSurface: parseSurface(minSurface),
      maxSurface: parseSurface(maxSurface),
      etiquetasIds: nuevos,
    });
  };

  return (
    <div ref={wrapperRef} className={`${geist.className} mt-3 w-full`}>
      <Accordion
        type="single"
        collapsible
        value={abierto ? "advanced" : ""}
        onValueChange={(val) => setAbierto(val === "advanced")}
        className="w-full"
      >
        <AccordionItem value="advanced" className="border-none">
          <div className="overflow-hidden rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              Avanzado
            </AccordionTrigger>
          </div>

          <AccordionContent className="pb-0 pt-3">
            <div className="flex flex-col gap-3">
              <SubDropdown
                label="Número de habitaciones"
                opciones={HABITACIONES}
                valor={habitaciones}
                onChange={(v) => {
                  setHabitaciones(v);
                  actualizar("habitaciones", v);
                }}
              />

              <SubDropdown
                label="Baños"
                opciones={BANOS}
                valor={banos}
                onChange={(v) => {
                  setBanos(v);
                  actualizar("banos", v);
                }}
              />

              <SubDropdown
                label="Piscina"
                opciones={PISCINA}
                valor={piscina}
                mostrarLabelConValor
                onChange={(v) => {
                  setPiscina(v);
                  actualizar("piscina", v);
                }}
              />

              <SurfaceRangeDropdown
                minValue={minSurface}
                maxValue={maxSurface}
                onMinChange={handleSurfaceInputChange("minSurface")}
                onMaxChange={handleSurfaceInputChange("maxSurface")}
                onClear={clearSurfaceRange}
              />

              <div className={surfaceError ? "block" : "hidden"}>
                <p className="text-center text-sm text-red-600">
                  {surfaceError}
                </p>
              </div>

              <div className="mt-4 border-t border-[#C8C0B5] pt-4">
                <h3 className="mb-3 text-sm font-bold text-[#2E2E2E]">Etiquetas Especiales</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags?.map((tag) => {
                    const isSelected = value?.etiquetasIds?.includes(tag.id_etiqueta);
                    return (
                      <button
                        key={tag.id_etiqueta}
                        type="button"
                        onClick={() => toggleTag(tag.id_etiqueta)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-[10px] font-bold uppercase transition-all border-2",
                          isSelected 
                            ? "border-[#1F3A4D] scale-105 shadow-md ring-1 ring-[#1F3A4D]" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                        style={{ backgroundColor: tag.color || '#6B7280', color: 'white' }}
                      >
                        {tag.nombre_etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}