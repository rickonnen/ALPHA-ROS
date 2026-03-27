/**
 * Dev: Gonzales Hetor    Fecha: 25/03/2026
 * Dev: Jose Alvarez    Fecha: 25/03/2026
 * Funcionalidad: Panel del Filtro en la pagina del home con cierre al clic externo.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; 

type Operacion = "Venta" | "Alquiler" | "Anticrético";
type TipoInmueble = "Casa" | "Departamento" | "Cuarto" | "Terreno" | "Espacio de cementerio";

const OPERACIONES: Operacion[] = ["Venta", "Alquiler", "Anticrético"];
const TIPOS: TipoInmueble[] = ["Casa", "Departamento", "Cuarto", "Terreno", "Espacio de cementerio"];

export default function FilterPanel() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null); // Referencia para el contenedor principal
  
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [tipo, setTipo] = useState<TipoInmueble | null>(null);
  const [ciudad, setCiudad] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"op" | "tipo" | null>(null);

  // Lógica para cerrar el dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOp = (val: Operacion) => {
    setOperaciones(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  };

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (operaciones.length > 0) p.set("operaciones", operaciones.join(","));
    if (tipo) p.set("tipo", tipo);
    if (ciudad.trim()) p.set("ciudad", ciudad.trim());
    router.push(`/busqueda?${p.toString()}`);
  };

  return (
    <div ref={panelRef} className="w-full flex flex-col gap-3 font-geist">
      {/* BARRA DE BÚSQUEDA PRINCIPAL */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 p-3 md:px-3 md:py-2 rounded-2xl md:rounded-full bg-[#E7E1D7] border border-[#C4BAA8] shadow-[0_4px_20px_rgba(31,58,77,0.12)]">
        
        {/* Dropdown: Operación */}
        <div className="relative flex-1 md:flex-none">
          <button 
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "op" ? null : "op")}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${openDropdown === "op" ? "bg-[#F4EFE6] text-[#1F3A4D] border-[#C4BAA8]" : "bg-[#1F3A4D] text-[#F4EFE6] border-[#1F3A4D]"}`}
          >
            {operaciones.length > 0 ? `Operación (${operaciones.length})` : "Seleccionar Operación"}
            <svg className={`w-3.5 h-3.5 transition-transform ${openDropdown === "op" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {openDropdown === "op" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden p-1">
              {OPERACIONES.map(op => (
                <button key={op} type="button" onClick={() => toggleOp(op)} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#E7E1D7]/60 rounded-lg text-left">
                  <span className={operaciones.includes(op) ? "font-bold text-[#1F3A4D]" : "text-[#2E2E2E]"}>{op}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${operaciones.includes(op) ? "bg-[#1F3A4D] border-[#1F3A4D]" : "border-[#A89F92] bg-[#F4EFE6]"}`}>
                    {operaciones.includes(op) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-[#C4BAA8] flex-shrink-0" />

        {/* Dropdown: Tipo */}
        <div className="relative flex-1 md:flex-none">
          <button 
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "tipo" ? null : "tipo")}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${openDropdown === "tipo" ? "bg-[#F4EFE6] text-[#1F3A4D] border-[#C4BAA8]" : "bg-[#1F3A4D] text-[#F4EFE6] border-[#1F3A4D]"}`}
          >
            {tipo ?? "Seleccionar Inmueble"}
            <svg className={`w-3.5 h-3.5 transition-transform ${openDropdown === "tipo" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {openDropdown === "tipo" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden p-1">
              {TIPOS.map(t => (
                <button 
                  key={t} 
                  type="button"
                  onClick={() => { setTipo(t); setOpenDropdown(null); }} 
                  className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${tipo === t ? "bg-[#E7E1D7] text-[#1F3A4D] font-bold" : "text-[#2E2E2E] hover:bg-[#E7E1D7]/60"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-[#C4BAA8] flex-shrink-0" />

        <div className="flex flex-1 items-center gap-2 px-1">
          <input 
            type="text" 
            placeholder="Search..." 
            className="flex-1 bg-transparent px-2 py-2 md:py-0 text-sm focus:outline-none text-[#2E2E2E] placeholder:text-[#A89F92]"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button 
            onClick={handleSearch} 
            className="flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#C26E5A] hover:bg-[#b05f4c] active:scale-95 flex items-center justify-center transition-all shadow-sm"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
          </button>
        </div>
      </div>

      {/* FILA DE ETIQUETAS (CHIPS) ABAJO */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap gap-2">
          {operaciones.map(op => (
            <span key={op} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] border border-[#C4BAA8] text-[#1F3A4D] animate-in fade-in duration-200 shadow-sm">
              {op}
              <button onClick={() => toggleOp(op)} className="hover:text-red-500 font-bold transition-colors">✕</button>
            </span>
          ))}
          {tipo && (
            <span key={tipo} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] border border-[#C4BAA8] text-[#1F3A4D] animate-in fade-in duration-200 shadow-sm">
              {tipo}
              <button onClick={() => setTipo(null)} className="hover:text-red-500 font-bold transition-colors">✕</button>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => { setOperaciones([]); setTipo(null); setCiudad(""); }} className="rounded-lg text-xs border-[#C4BAA8] text-[#2E2E2E] hover:bg-[#E7E1D7]">Limpiar</Button>
          <Button size="sm" onClick={() => router.push("/busqueda?avanzado=true")} className="rounded-lg text-xs bg-[#1F3A4D] text-white hover:bg-[#162d3d]">Avanzado</Button>
        </div>
      </div>
    </div>
  );
}