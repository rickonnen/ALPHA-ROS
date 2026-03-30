"use client";

import { useState, useRef, useEffect } from "react";
import { Geist } from "next/font/google";

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
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((p) => !p)}
        className="w-full px-3 py-2 border border-[#E7E1D7] rounded-md bg-[#E7E1D7] text-sm flex justify-between items-center text-[#2E2E2E] hover:bg-[#DDD7CD] transition-colors"
      >
        <span className={valor ? "font-medium" : "text-[#2E2E2E]/60"}>
          {valor || label}
        </span>
        <span
          className="text-[#2E2E2E]/50 transition-transform duration-200"
          style={{ display: "inline-block", transform: abierto ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {abierto && (
        <ul className="absolute top-full mt-1 w-full bg-white border border-[#E7E1D7] rounded-md z-50 shadow-sm overflow-hidden">
          {opciones.map((op, i) => (
            <li
              key={i}
              onMouseDown={() => {
                onChange(op);
                setAbierto(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                valor === op
                  ? "bg-[#1F3A4D] text-white"
                  : "hover:bg-[#E7E1D7] text-[#2E2E2E]"
              }`}
            >
              {op}
            </li>
          ))}
        </ul>
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
    <div
      ref={wrapperRef}
      className={`${geist.className} bg-[#F4EFE6] border border-[#E7E1D7] rounded-lg p-5 w-72`}
    >
      <button
        onClick={() => setAbierto((p) => !p)}
        className="w-full flex justify-between items-center text-sm font-semibold text-[#2E2E2E] hover:text-[#C26E5A] transition-colors"
      >
        <span>avanzado</span>
        <span
          className="transition-transform duration-300"
          style={{ display: "inline-block", transform: abierto ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {abierto && (
        <div className="flex flex-col gap-3 mt-4">
          <SubDropdown
            label="Número total de habitaciones"
            opciones={HABITACIONES}
            valor={habitaciones}
            onChange={(v) => { setHabitaciones(v); actualizar("habitaciones", v); }}
          />

          <SubDropdown
            label="Baños"
            opciones={BANOS}
            valor={banos}
            onChange={(v) => { setBanos(v); actualizar("banos", v); }}
          />

          <SubDropdown
            label="Piscina"
            opciones={PISCINA}
            valor={piscina}
            onChange={(v) => { setPiscina(v); actualizar("piscina", v); }}
          />
        </div>
      )}
    </div>
  );
}