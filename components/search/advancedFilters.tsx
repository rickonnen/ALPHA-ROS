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

const PISCINA = ["Sí", "No"];

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
        <span className={valor ? "font-normal text-[#2E2E2E]" : "text-[#2E2E2E]"}>
          {valor || label}
        </span>

        <span
          className="text-[#4B4B4B] transition-transform duration-200"
          style={{
            display: "inline-block",
            transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {abierto && (
        <div className="mt-3 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
          <div className="space-y-2">
            {opciones.map((op, i) => {
              const checked = valor === op;

              return (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => {
                    onChange(op);
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
        </div>
      )}
    </div>
  );
}

interface Props {
  onChange: (valores: { habitaciones: string; banos: string; piscina: string }) => void;
}

export default function FiltrosAvanzado({ onChange }: Props) {
  const [abierto, setAbierto] = useState(false);

  const [habitaciones, setHabitaciones] = useState("");
  const [banos, setBanos] = useState("");
  const [piscina, setPiscina] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const actualizar = (campo: string, valor: string) => {
    const nuevo = { habitaciones, banos, piscina, [campo]: valor };
    onChange(nuevo);
  };

  return (
    <div ref={wrapperRef} className={`${geist.className} w-full mt-3`}>
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

          <AccordionContent className="pt-3 pb-0 overflow-visible">
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}