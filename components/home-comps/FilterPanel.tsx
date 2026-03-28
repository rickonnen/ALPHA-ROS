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
  const objPanelRef = useRef<HTMLDivElement>(null); 
  const objActiveItemRef = useRef<HTMLLIElement>(null);

  const [arrOperations, setArrOperations] = useState<string[]>([]);
  const [strPropertyType, setStrPropertyType] = useState<string | null>(null);
  const [strOpenDropdown, setStrOpenDropdown] = useState<"operation" | "type" | null>(null);

  const {
    strCity,
    setStrCity,
    arrSuggestions,
    bolShowSuggestions,
    setBolShowSuggestions,
    bolNoResults,
    setBolNoResults,
    intSelectedIndex,
    setIntSelectedIndex,
    intMaxCityLength,
    handleCityChange,
    handleSelectSuggestion,
    handleKeyDown,
  } = useCitySearch(); 

  useEffect(() => {
    const handleClickOutside = (objEvent: MouseEvent) => {
      if (objPanelRef.current && !objPanelRef.current.contains(objEvent.target as Node)) {
        setStrOpenDropdown(null);
        setBolShowSuggestions(false);
        setBolNoResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setBolShowSuggestions, setBolNoResults]);

  useEffect(() => {
    if (objActiveItemRef.current) {
      objActiveItemRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [intSelectedIndex]);

  const toggleOperation = (strVal: string) => {
    setArrOperations((arrPrev) =>
      arrPrev.includes(strVal) ? arrPrev.filter((strItem) => strItem !== strVal) : [...arrPrev, strVal]
    );
  };

  const handleSearch = () => {
    const objParams = new URLSearchParams();
    if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
    if (strPropertyType) objParams.set("tipo", strPropertyType);
    if (strCity.trim()) objParams.set("ciudad", strCity.trim());
    objRouter.push(`/busqueda?${objParams.toString()}`);
  };

  const strDropdownBaseClass = "w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]";
  const strDropdownActiveStyle = "bg-[#F4EFE6] text-[#2E2E2E] border-[#C4BAA8]";
  const strDropdownInactiveStyle = "bg-[#1F3A4D] text-[#E7E1D7] border-[#1F3A4D]";
  
  const strChipClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] border border-[#C4BAA8] text-[#2E2E2E] animate-in fade-in duration-200 shadow-sm focus-within:ring-2 focus-within:ring-[#1F3A4D] focus-within:ring-offset-2 focus-within:ring-offset-[#E7E1D7]";

  return (
    <div ref={objPanelRef} className="w-full flex flex-col gap-3 font-geist">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 p-3 md:px-3 md:py-2 rounded-2xl md:rounded-full bg-[#E7E1D7] border border-[#C4BAA8] shadow-[0_4px_20px_rgba(31,58,77,0.12)]">
        
        <div className="relative flex-1 md:flex-none">
          <button
            type="button"
            onClick={() => setStrOpenDropdown(strOpenDropdown === "operation" ? null : "operation")}
            className={`${strDropdownBaseClass} ${strOpenDropdown === "operation" ? strDropdownActiveStyle : strDropdownInactiveStyle}`}
          >
            {arrOperations.length > 0 ? `Operación (${arrOperations.length})` : "Seleccionar Operación"}
            <svg className={`w-3.5 h-3.5 transition-transform ${strOpenDropdown === "operation" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {strOpenDropdown === "operation" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden p-1">
              {arrOperationOptions.map((strOperationOption) => (
                <button
                  key={strOperationOption}
                  type="button"
                  onClick={() => toggleOperation(strOperationOption)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#E7E1D7]/60 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE6]"
                >
                  <span className={arrOperations.includes(strOperationOption) ? "font-bold text-[#2E2E2E]" : "text-[#2E2E2E]"}>{strOperationOption}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${arrOperations.includes(strOperationOption) ? "bg-[#1F3A4D] border-[#1F3A4D]" : "border-[#A89F92] bg-[#F4EFE6]"}`}>
                    {arrOperations.includes(strOperationOption) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-[#C4BAA8] flex-shrink-0" />

        <div className="relative flex-1 md:flex-none">
          <button
            type="button"
            onClick={() => setStrOpenDropdown(strOpenDropdown === "type" ? null : "type")}
            className={`${strDropdownBaseClass} ${strOpenDropdown === "type" ? strDropdownActiveStyle : strDropdownInactiveStyle}`}
          >
            {strPropertyType ?? "Seleccionar Inmueble"}
            <svg className={`w-3.5 h-3.5 transition-transform ${strOpenDropdown === "type" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {strOpenDropdown === "type" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden p-1">
              {arrPropertyTypes.map((strPropertyOption) => (
                <button
                  key={strPropertyOption}
                  type="button"
                  onClick={() => { setStrPropertyType(strPropertyOption); setStrOpenDropdown(null); }}
                  className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE6] ${
                  strPropertyType === strPropertyOption ? "bg-[#E7E1D7] text-[#2E2E2E] font-bold" : "text-[#2E2E2E] hover:bg-[#E7E1D7]/60"
                }`}
                >
                  {strPropertyOption}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-[#C4BAA8] flex-shrink-0" />

        <div className="relative flex flex-1 items-center gap-2 px-1">
          <input
            type="text"
            placeholder="Search for..."
            className="flex-1 bg-transparent px-2 py-2 md:py-0 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7] rounded-md text-[#2E2E2E] placeholder:text-[#A89F92]"
            value={strCity}
            maxLength={intMaxCityLength}
            onChange={(objEvent) => handleCityChange(objEvent.target.value)}
            onFocus={() => {
              if (strCity.trim().length >= 2) {
                if (arrSuggestions.length > 0) setBolShowSuggestions(true);
                else setBolNoResults(true); 
              }
            }}
            onKeyDown={(objEvent) => {
              if (bolShowSuggestions && arrSuggestions.length > 0) {
                handleKeyDown(objEvent as any);
                return;
              }

              if (objEvent.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            type="button"
            onClick={handleSearch}
            className="flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#1F3A4D] hover:bg-[#162d3d] active:scale-95 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4 text-[#E7E1D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </button>

          {bolShowSuggestions && (
            <ul className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-2xl overflow-y-auto max-h-[120px] md:max-h-[180px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#C4BAA8] hover:[&::-webkit-scrollbar-thumb]:bg-[#A89F92] [&::-webkit-scrollbar-thumb]:rounded-full">
              {arrSuggestions.map((objSuggestion, intIndex) => {
                const arrParts = objSuggestion.strFullName.split(',');
                const strSecondary = arrParts.slice(1).join(',').replace(/Bolivia/gi, '').replace(/,\s*$/, '').trim();
                const bolIsSelected = intSelectedIndex === intIndex;

                return (
                  <li
                    key={objSuggestion.strId}
                    ref={bolIsSelected ? objActiveItemRef : null}
                    onMouseEnter={() => setIntSelectedIndex(intIndex)}
                    onClick={() => handleSelectSuggestion(objSuggestion)}
                    tabIndex={0}
                    onKeyDown={(objEvent) => {
                      if (objEvent.key === 'Enter') {
                        handleSelectSuggestion(objSuggestion);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#E7E1D7] last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-inset ${
                      bolIsSelected ? "bg-[#E7E1D7]" : "hover:bg-[#E7E1D7]"
                    }`}
                  >
                    <img src={objSuggestion.strIcon} alt="BO" className="h-4 w-5 flex-shrink-0" />
                    
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-[#2E2E2E] truncate">
                        {objSuggestion.strName}
                      </span>
                      
                      {(objSuggestion.strTypePlace || strSecondary) && (
                        <span className="text-xs text-[#A89F92] truncate flex items-center gap-1.5 mt-0.5">
                          {objSuggestion.strTypePlace && (
                            <span className="font-semibold text-[#8b8276] bg-[#E7E1D7] px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                              {objSuggestion.strTypePlace}
                            </span>
                          )}
                          {strSecondary && (
                            <span className="truncate">
                              {strSecondary.replace(/^,\s*/, '')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {bolNoResults && strCity.trim().length >= 2 && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-[#F4EFE6] border border-[#C4BAA8] rounded-xl p-3 text-sm text-[#2E2E2E] shadow-xl">
            No se encontraron resultados
            </div>
          )}
        </div>
      </div>  

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap gap-2">
          {arrOperations.map((strOperationOption) => (
            <span key={strOperationOption} className={strChipClass}>
              {strOperationOption}
              <button type="button" onClick={() => toggleOperation(strOperationOption)} className="hover:text-red-500 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full px-1">✕</button>
            </span>
          ))}
          {strPropertyType && (
            <span key={strPropertyType} className={strChipClass}>
              {strPropertyType}
              <button type="button" onClick={() => setStrPropertyType(null)} className="hover:text-red-500 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full px-1">✕</button>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            size="sm"
            onClick={() => {
              setArrOperations([]);
              setStrPropertyType(null);
              setStrCity("");
            }}
            className="rounded-lg text-xs bg-[#c26e5a] text-[#E7E1D7] transition-all duration-300 hover:bg-[#b05f4c] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
            >
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={() => objRouter.push("/busqueda?avanzado=true")}
            className="rounded-lg text-xs bg-[#1F3A4D] text-[#E7E1D7] transition-all duration-300 hover:bg-[#162d3d] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
            >
            Avanzado
          </Button>
        </div>
      </div>
    </div>
  );
}