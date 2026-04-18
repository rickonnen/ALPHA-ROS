"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { Geist } from "next/font/google";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
  children?: React.ReactNode;
}

function SubDropdown({
  label,
  opciones = [],
  valor = "",
  onChange,
  children,
}: SubDropdownProps) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasCustomContent = Boolean(children);

  return (
    <div ref={ref} className="w-full">
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] shadow-sm transition-colors hover:bg-[#DDD7CD]"
      >
        
        {/* 1. El texto se queda solo a la izquierda */}
      <span className={valor ? "font-normal text-[#2E2E2E]" : "text-[#2E2E2E]"}>
        {valor || label}
      </span>

      {/* 2. La X y la Flecha se juntan para irse a la derecha cambio 3*/}
      <div className="flex items-center gap-2">
        {valor && (
          <X 
            size={16} 
            className="text-[#4B4B4B] hover:text-red-500 transition-colors" 
            onClick={(e) => {
              e.stopPropagation();
              onChange?.("");
            }} 
          />
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
        <div className="mt-3 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
          {hasCustomContent ? (
            children
          ) : (
            <div className="space-y-2">
              {opciones.map((op, i) => {
                const checked = valor === op;

                return (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => {
                      onChange?.(op);
                      setAbierto(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm transition",
                      checked
                        ? "bg-[#E7E3DD] text-[#2E2E2E]"
                        : "bg-transparent text-[#2E2E2E] hover:bg-[#F4EFE6]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition",
                        checked
                          ? "border-[#6B6B6B] bg-white"
                          : "border-[#8A847C] bg-white"
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
          )}
        </div>
      )}
    </div>
  );
}

interface AdvancedFiltersValues {
  habitaciones: string;
  banos: string;
  piscina: string;
  minSurface: string;
  maxSurface: string;
}

interface Props {
  onChange: (valores: AdvancedFiltersValues) => void;
  value?: AdvancedFiltersValues;
}

export default function FiltrosAvanzado({ onChange, value }: Props) {
  const [abierto, setAbierto] = useState(false);

  const [habitaciones, setHabitaciones] = useState(value?.habitaciones ?? "");
  const [banos, setBanos] = useState(value?.banos ?? "");
  const [piscina, setPiscina] = useState(value?.piscina ?? "");
  const [minSurface, setMinSurface] = useState(value?.minSurface ?? "");
  const [maxSurface, setMaxSurface] = useState(value?.maxSurface ?? "");
  const [surfaceError, setSurfaceError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHabitaciones(value?.habitaciones ?? "");
    setBanos(value?.banos ?? "");
    setPiscina(value?.piscina ?? "");
    setMinSurface(value?.minSurface ?? "");
    setMaxSurface(value?.maxSurface ?? "");
  }, [
    value?.habitaciones,
    value?.banos,
    value?.piscina,
    value?.minSurface,
    value?.maxSurface,
  ]);

  const actualizar = (
    campo: "habitaciones" | "banos" | "piscina" | "minSurface" | "maxSurface",
    valor: string
  ) => {
    onChange({
      habitaciones: campo === "habitaciones" ? valor : habitaciones,
      banos: campo === "banos" ? valor : banos,
      piscina: campo === "piscina" ? valor : piscina,
      minSurface: campo === "minSurface" ? valor : minSurface,
      maxSurface: campo === "maxSurface" ? valor : maxSurface,
    });
  };

  const handleSurfaceInputChange =
    (field: "minSurface" | "maxSurface") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (value === "") {
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

      const validSurface = /^\d*\.?\d*$/.test(value);

      if (!validSurface) {
        setSurfaceError("Solo se permiten números");
        return;
      }

      setSurfaceError(null);

      if (field === "minSurface") {
        setMinSurface(value);
        actualizar("minSurface", value);
      } else {
        setMaxSurface(value);
        actualizar("maxSurface", value);
      }
    };

  const surfaceLabel =
    minSurface && maxSurface
      ? `${minSurface}m² - ${maxSurface}m²`
      : minSurface
      ? `Desde ${minSurface}m²`
      : maxSurface
      ? `Hasta ${maxSurface}m²`
      : "";

  return (
    <div ref={wrapperRef} className={`${geist.className} mt-3 w-full`}>
      <Accordion
        type="single"
        collapsible
        value={abierto ? "advanced" : ""}
        onValueChange={(value) => setAbierto(value === "advanced")}
        className="w-full"
      >
        <AccordionItem value="advanced" className="border-none">
          <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              Avanzado
            </AccordionTrigger>
          </div>

          <AccordionContent className="overflow-visible pt-3 pb-0">
            <div className="flex flex-col gap-3 overflow-visible">
              <SubDropdown
                label="Número total de habitaciones"
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
                onChange={(v) => {
                  setPiscina(v);
                  actualizar("piscina", v);
                }}
              />

              <SubDropdown label="Superficie m²" valor={surfaceLabel}>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Min m²"
                      value={minSurface}
                      onChange={handleSurfaceInputChange("minSurface")}
                      className={cn(
                        "w-full rounded-[12px] border bg-[#F7F4EF] px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6B6B6B]",
                        surfaceError === "Solo se permiten números"
                          ? "border-red-500"
                          : "border-[#B9B1A5]"
                      )}
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Max m²"
                      value={maxSurface}
                      onChange={handleSurfaceInputChange("maxSurface")}
                      className={cn(
                        "w-full rounded-[12px] border bg-[#F7F4EF] px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6B6B6B]",
                        surfaceError === "Solo se permiten números"
                          ? "border-red-500"
                          : "border-[#B9B1A5]"
                      )}
                    />
                  </div>

                  <div className={surfaceError ? "block" : "hidden"}>
                    <p className="text-center text-sm text-red-600">
                      {surfaceError}
                    </p>
                  </div>
                </div>
              </SubDropdown>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 