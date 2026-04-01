"use client";

import { useState, useRef, useEffect } from "react";
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
const GENERAL = ["Sí", "No"];

export interface FiltrosAvanzadoValores {
  habitaciones: string;
  banos: string;
  piscina: string;
  patio: string;
  garaje: string;
  amueblada: string;
  lavanderia: string;
  balcon: string;
}

const CAMPOS: { key: keyof FiltrosAvanzadoValores; label: string; opciones: string[] }[] = [
  { key: "habitaciones", label: "Número total de habitaciones", opciones: HABITACIONES },
  { key: "banos",        label: "Baños",                        opciones: BANOS },
  { key: "piscina",      label: "Piscina",                      opciones: GENERAL },
  { key: "patio",        label: "Patio/Jardín",                 opciones: GENERAL },
  { key: "garaje",       label: "Garaje",                       opciones: GENERAL },
  { key: "amueblada",    label: "Amueblada",                    opciones: GENERAL },
  { key: "lavanderia",   label: "Lavandería",                   opciones: GENERAL },
  { key: "balcon",       label: "Balcón/Terraza",               opciones: GENERAL },
];

const VALORES_INICIALES: FiltrosAvanzadoValores = {
  habitaciones: "",
  banos: "",
  piscina: "",
  patio: "",
  garaje: "",
  amueblada: "",
  lavanderia: "",
  balcon: "",
};

interface SubDropdownProps {
  label: string;
  opciones: string[];
  valor: string;
  onChange: (v: string) => void;
}

function SubDropdown({ label, opciones, valor, onChange }: SubDropdownProps) {
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

  return (
    <div ref={ref} className="w-full">
      <button
        type="button"
        onClick={() => setAbierto((p) => !p)}
        className="flex w-full items-center justify-between rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] shadow-sm transition-colors hover:bg-[#DDD7CD]"
      >
        <span>{valor || label}</span>
        <span
          className="text-[#4B4B4B] transition-transform duration-200"
          style={{ display: "inline-block", transform: abierto ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {abierto && (
        <div className="mt-3 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
          <div className="space-y-2">
            {opciones.map((op) => {
              const checked = valor === op;
              return (
                <button
                  key={op}
                  type="button"
                  onMouseDown={() => { onChange(op); setAbierto(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm transition",
                    checked ? "bg-[#E7E3DD]" : "bg-transparent hover:bg-[#F4EFE6]"
                  )}
                >
                  <span className={cn(
                    "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition",
                    checked ? "border-[#6B6B6B] bg-white" : "border-[#8A847C] bg-white"
                  )}>
                    <span className={cn(
                      "h-[8px] w-[8px] rounded-full bg-[#1F3A4D] transition",
                      checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )} />
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

interface Props {
  onChange: (valores: FiltrosAvanzadoValores) => void;
}

export default function FiltrosAvanzado({ onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState<FiltrosAvanzadoValores>(VALORES_INICIALES);

  const handleChange = (campo: keyof FiltrosAvanzadoValores, valor: string) => {
    const nuevo = { ...valores, [campo]: valor };
    setValores(nuevo);
    onChange(nuevo);
  };

  return (
    <div className={`${geist.className} w-full mt-3`}>
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
              avanzado
            </AccordionTrigger>
          </div>

          <AccordionContent className="pt-3 pb-0 overflow-visible">
            <div className="flex flex-col gap-3 overflow-visible">
              {CAMPOS.map(({ key, label, opciones }) => (
                <SubDropdown
                  key={key}
                  label={label}
                  opciones={opciones}
                  valor={valores[key]}
                  onChange={(v) => handleChange(key, v)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}