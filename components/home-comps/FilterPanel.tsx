/**
 * Dev: Gonzales Hetor    Fecha: 25/03/2026
 * Dev: Jose Alvarez     Fecha: 25/03/2026
 * Funcionalidad: Panel del Filtro en la pagina del home.
 * Funcionalidad: Panel del Filtro en la pagina del home con cierre al clic externo.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { useCitySearch } from "../hooks/useCitySearch"; 

const arrOperationOptions = ["Venta", "Alquiler", "Anticrético"];
const arrPropertyTypes = ["Casa", "Departamento", "Cuarto", "Terreno", "Espacio de cementerio"];

export default function FilterPanel() {
  const objRouter = useRouter();
  const refPanel = useRef<HTMLDivElement>(null); 

  const [arrOperaciones, setArrOperaciones] = useState<string[]>([]);
  const [strTipo, setStrTipo] = useState<string | null>(null);
  const [strOpenDropdown, setStrOpenDropdown] = useState<"op" | "tipo" | null>(null);

  // Lógica de búsqueda predictiva extraída (Sin parámetros)
  const {
    strCiudad,
    setStrCiudad,
    arrSuggestions,
    bolShowSuggestions,
    setBolShowSuggestions,
    bolNoResults,
    handleCityChange,
  } = useCitySearch(); 

  // Cierre de menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (objEvent: MouseEvent) => {
      if (refPanel.current && !refPanel.current.contains(objEvent.target as Node)) {
        setStrOpenDropdown(null);
        setBolShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setBolShowSuggestions]);

  const toggleOp = (strVal: string) => {
    setArrOperaciones((arrPrev) =>
      arrPrev.includes(strVal) ? arrPrev.filter((strItem) => strItem !== strVal) : [...arrPrev, strVal]
    );
  };

  const handleSearch = () => {
    const objParams = new URLSearchParams();
    if (arrOperaciones.length > 0) objParams.set("operaciones", arrOperaciones.join(","));
    if (strTipo) objParams.set("tipo", strTipo);
    if (strCiudad.trim()) objParams.set("ciudad", strCiudad.trim());
    objRouter.push(`/busqueda?${objParams.toString()}`);
  };

  return (
    <div ref={refPanel} className="w-full flex flex-col gap-3 font-geist">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 p-3 md:px-3 md:py-2 rounded-2xl md:rounded-full bg-[#E7E1D7] border border-[#C4BAA8] shadow-[0_4px_20px_rgba(31,58,77,0.12)]">
        
        {/* Dropdown: Operación */}
        <div className="relative flex-1 md:flex-none">
          <button
            type="button"
            onClick={() => setStrOpenDropdown(strOpenDropdown === "op" ? null : "op")}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
              strOpenDropdown === "op" ? "bg-[#F4EFE6] text-[#1F3A4D] border-[#C4BAA8]" : "bg-[#1F3A4D] text-[#F4EFE6] border-[#1F3A4D]"
            }`}
          >
            {arrOperaciones.length > 0 ? `Operación (${arrOperaciones.length})` : "Seleccionar Operación"}
            <svg className={`w-3.5 h-3.5 transition-transform ${strOpenDropdown === "op" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {strOpenDropdown === "op" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden p-1">
              {arrOperationOptions.map((strOp) => (
                <button
                  key={strOp}
                  type="button"
                  onClick={() => toggleOp(strOp)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#E7E1D7]/60 rounded-lg text-left"
                >
                  <span className={arrOperaciones.includes(strOp) ? "font-bold text-[#1F3A4D]" : "text-[#2E2E2E]"}>{strOp}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${arrOperaciones.includes(strOp) ? "bg-[#1F3A4D] border-[#1F3A4D]" : "border-[#A89F92] bg-[#F4EFE6]"}`}>
                    {arrOperaciones.includes(strOp) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
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
            onClick={() => setStrOpenDropdown(strOpenDropdown === "tipo" ? null : "tipo")}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
              strOpenDropdown === "tipo" ? "bg-[#F4EFE6] text-[#1F3A4D] border-[#C4BAA8]" : "bg-[#1F3A4D] text-[#F4EFE6] border-[#1F3A4D]"
            }`}
          >
            {strTipo ?? "Seleccionar Inmueble"}
            <svg className={`w-3.5 h-3.5 transition-transform ${strOpenDropdown === "tipo" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {strOpenDropdown === "tipo" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden p-1">
              {arrPropertyTypes.map((strType) => (
                <button
                  key={strType}
                  type="button"
                  onClick={() => { setStrTipo(strType); setStrOpenDropdown(null); }}
                  className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${strTipo === strType ? "bg-[#E7E1D7] text-[#1F3A4D] font-bold" : "text-[#2E2E2E] hover:bg-[#E7E1D7]/60"}`}
                >
                  {strType}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-[#C4BAA8] flex-shrink-0" />

        {/* Input Predictivo */}
        <div className="relative flex flex-1 items-center gap-2 px-1">
          <input
            type="text"
            placeholder="Search for..."
            className="flex-1 bg-transparent px-2 py-2 md:py-0 text-sm focus:outline-none text-[#2E2E2E] placeholder:text-[#A89F92]"
            value={strCiudad}
            onChange={(objEvent) => handleCityChange(objEvent.target.value)}
            onKeyDown={(objEvent) => objEvent.key === "Enter" && handleSearch()}
          />

          <button
            type="button"
            onClick={handleSearch}
            className="flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#C26E5A] hover:bg-[#b05f4c] active:scale-95 flex items-center justify-center transition-all shadow-sm"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </button>

          {/* Sugerencias Mapbox */}
          {bolShowSuggestions && (
            <ul className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-2xl overflow-hidden">
              {arrSuggestions.map((objItem) => (
                <li
                  key={objItem.strId}
                  onClick={() => { setStrCiudad(objItem.strName); setBolShowSuggestions(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#E7E1D7] cursor-pointer border-b border-[#E7E1D7] last:border-0 transition-colors"
                >
                  <img src={objItem.strIcon} alt="BO" className="h-4 w-5" />
                  <span className="text-[#2E2E2E]">{objItem.strName}</span>
                </li>
              ))}
            </ul>
          )}

          {bolNoResults && strCiudad.trim().length >= 2 && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-[#F4EFE6] border border-[#C4BAA8] rounded-xl p-3 text-sm text-[#C26E5A] shadow-xl">
              No se encontraron resultados en Bolivia
            </div>
          )}
        </div>
      </div>

      {/* CHIPS Y ACCIONES */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap gap-2">
          {arrOperaciones.map((strOp) => (
            <span key={strOp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] border border-[#C4BAA8] text-[#1F3A4D] animate-in fade-in duration-200 shadow-sm">
              {strOp}
              <button type="button" onClick={() => toggleOp(strOp)} className="hover:text-red-500 font-bold transition-colors">✕</button>
            </span>
          ))}
          {strTipo && (
            <span key={strTipo} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] border border-[#C4BAA8] text-[#1F3A4D] animate-in fade-in duration-200 shadow-sm">
              {strTipo}
              <button type="button" onClick={() => setStrTipo(null)} className="hover:text-red-500 font-bold transition-colors">✕</button>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setArrOperaciones([]);
              setStrTipo(null);
              setStrCiudad("");
            }}
            className="rounded-lg text-xs border-[#C4BAA8] text-[#2E2E2E] hover:bg-[#E7E1D7]"
          >
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={() => objRouter.push("/busqueda?avanzado=true")}
            className="rounded-lg text-xs bg-[#1F3A4D] text-white hover:bg-[#162d3d]"
          >
            Avanzado
          </Button>
        </div>
      </div>
    </div>
  );
}