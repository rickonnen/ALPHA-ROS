/**
 * Dev: Gonzales Hetor     Fecha: 25/03/2026
 * Dev: Jose Alvarez      Fecha: 25/03/2026
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
  const [intDropdownIndex, setIntDropdownIndex] = useState<number>(-1);

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

  useEffect(() => {
    setIntDropdownIndex(-1);
  }, [strOpenDropdown]);

  const toggleOperation = (strVal: string) => {
    setArrOperations((arrPrev) =>
      arrPrev.includes(strVal) ? arrPrev.filter((strItem) => strItem !== strVal) : [...arrPrev, strVal]
    );
  };

  const handleDropdownKeyDown = (objEvent: React.KeyboardEvent, arrOptions: string[], fnSelect: (val: string) => void) => {
    if (!strOpenDropdown) return;

    if (objEvent.key === "ArrowDown") {
      objEvent.preventDefault();
      setIntDropdownIndex((prev) => (prev < arrOptions.length - 1 ? prev + 1 : 0));
    } else if (objEvent.key === "ArrowUp") {
      objEvent.preventDefault();
      setIntDropdownIndex((prev) => (prev > 0 ? prev - 1 : arrOptions.length - 1));
    } else if (objEvent.key === "Enter" && intDropdownIndex !== -1) {
      objEvent.preventDefault();
      fnSelect(arrOptions[intDropdownIndex]);
    } else if (objEvent.key === "Escape") {
      setStrOpenDropdown(null);
    }
  };

  const handleSearch = (bolAvanzado = false) => {
    const objParams = new URLSearchParams();
    if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
    if (strPropertyType) objParams.set("tipo", strPropertyType);
    if (strCity.trim()) objParams.set("ciudad", strCity.trim());
    if (bolAvanzado) objParams.set("avanzado", "true");

    const strQuery = objParams.toString();
    objRouter.push(strQuery ? `/busqueda?${strQuery}` : "/busqueda");
  };

  const strDropdownBaseClass = "w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund";
  const strDropdownActiveStyle = "bg-background text-foreground border-border";
  const strDropdownInactiveStyle = "bg-primary text-primary-foreground border-primary";
  
  const strChipClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background border border-border text-foreground animate-in fade-in duration-200 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-secondary-fund";

  return (
    <div ref={objPanelRef} className="w-full flex flex-col gap-3 font-geist">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 p-3 md:px-3 md:py-2 rounded-2xl md:rounded-full bg-secondary-fund border border-border shadow-xl">
        
        <div className="relative flex-1 md:flex-none">
          <button
            type="button"
            onClick={() => setStrOpenDropdown(strOpenDropdown === "operation" ? null : "operation")}
            onKeyDown={(e) => handleDropdownKeyDown(e, arrOperationOptions, toggleOperation)}
            className={`${strDropdownBaseClass} ${strOpenDropdown === "operation" ? strDropdownActiveStyle : strDropdownInactiveStyle}`}
          >
            {arrOperations.length > 0 ? `Operación (${arrOperations.length})` : "Seleccionar Operación"}
            <svg className={`w-3.5 h-3.5 transition-transform ${strOpenDropdown === "operation" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {strOpenDropdown === "operation" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-background rounded-xl border border-border shadow-lg overflow-hidden p-1">
              {arrOperationOptions.map((strOperationOption, index) => (
                <button
                  key={strOperationOption}
                  type="button"
                  onClick={() => toggleOperation(strOperationOption)}
                  onMouseEnter={() => setIntDropdownIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${intDropdownIndex === index ? "bg-secondary-fund" : "hover:bg-secondary-fund/60"}`}
                >
                  <span className={arrOperations.includes(strOperationOption) || intDropdownIndex === index ? "font-bold text-foreground" : "text-foreground"}>{strOperationOption}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${arrOperations.includes(strOperationOption) ? "bg-primary border-primary" : "border-muted-foreground bg-background"}`}>
                    {arrOperations.includes(strOperationOption) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-border flex-shrink-0" />

        <div className="relative flex-1 md:flex-none">
          <button
            type="button"
            onClick={() => setStrOpenDropdown(strOpenDropdown === "type" ? null : "type")}
            onKeyDown={(e) => handleDropdownKeyDown(e, arrPropertyTypes, (val) => { setStrPropertyType(val); setStrOpenDropdown(null); })}
            className={`${strDropdownBaseClass} ${strOpenDropdown === "type" ? strDropdownActiveStyle : strDropdownInactiveStyle}`}
          >
            {strPropertyType ?? "Seleccionar Inmueble"}
            <svg className={`w-3.5 h-3.5 transition-transform ${strOpenDropdown === "type" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {strOpenDropdown === "type" && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-background rounded-xl border border-border shadow-lg overflow-hidden p-1">
              {arrPropertyTypes.map((strPropertyOption, index) => (
                <button
                  key={strPropertyOption}
                  type="button"
                  onClick={() => { setStrPropertyType(strPropertyOption); setStrOpenDropdown(null); }}
                  onMouseEnter={() => setIntDropdownIndex(index)}
                  className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  strPropertyType === strPropertyOption || intDropdownIndex === index ? "bg-secondary-fund text-foreground font-bold" : "text-foreground hover:bg-secondary-fund/60"
                }`}
                >
                  {strPropertyOption}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full md:w-px md:h-5 bg-border flex-shrink-0" />

        <div className="relative flex flex-1 items-center gap-2 px-1">
          <input
            type="text"
            placeholder="Buscar por..."
            className="flex-1 bg-transparent px-2 py-2 md:py-0 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund rounded-md text-foreground placeholder:text-muted-foreground"
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
                const suggestion = arrSuggestions[intSelectedIndex];
                if (suggestion) {
                  const objParams = new URLSearchParams();
                  if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
                  if (strPropertyType) objParams.set("tipo", strPropertyType);
                  objParams.set("ciudad", suggestion.strName.trim());
                  const strQuery = objParams.toString();
                  objRouter.push(strQuery ? `/busqueda?${strQuery}` : "/busqueda");
                } else {
                  handleSearch(false);
                }
              }
            }}
          />

          <button
            type="button"
            onClick={() => handleSearch(false)}
            className="flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full bg-primary hover:bg-primary/90 active:scale-95 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund"
          >
            <svg className="w-5 h-5 md:w-4 md:h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </button>

          {bolShowSuggestions && (
            <ul className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background rounded-xl border border-border shadow-2xl overflow-y-auto max-h-[120px] md:max-h-[180px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
              {arrSuggestions.map((objSuggestion, intIndex) => {
                const arrParts = objSuggestion.strFullName.split(',');
                const strSecondary = arrParts.slice(1).join(',').replace(/Bolivia/gi, '').replace(/,\s*$/, '').trim();
                const bolIsSelected = intSelectedIndex === intIndex;

                return (
                  <li
                    key={objSuggestion.strId}
                    ref={bolIsSelected ? objActiveItemRef : null}
                    onMouseEnter={() => setIntSelectedIndex(intIndex)}
                    onClick={() => {
                      handleSelectSuggestion(objSuggestion);
                      const objParams = new URLSearchParams();
                      if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
                      if (strPropertyType) objParams.set("tipo", strPropertyType);
                      objParams.set("ciudad", objSuggestion.strName.trim());
                      const strQuery = objParams.toString();
                      objRouter.push(strQuery ? `/busqueda?${strQuery}` : "/busqueda");
                    }}
                    tabIndex={0}
                    onKeyDown={(objEvent) => {
                      if (objEvent.key === 'Enter') {
                        handleSelectSuggestion(objSuggestion);
                        const objParams = new URLSearchParams();
                        if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
                        if (strPropertyType) objParams.set("tipo", strPropertyType);
                        objParams.set("ciudad", objSuggestion.strName.trim());
                        const strQuery = objParams.toString();
                        objRouter.push(strQuery ? `/busqueda?${strQuery}` : "/busqueda");
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-secondary-fund last:border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                      bolIsSelected ? "bg-secondary-fund" : "hover:bg-secondary-fund"
                    }`}
                  >
                    <img src={objSuggestion.strIcon} alt="BO" className="h-4 w-5 flex-shrink-0" />
                    
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-foreground truncate">
                        {objSuggestion.strName}
                      </span>
                      
                      {(objSuggestion.strTypePlace || strSecondary) && (
                        <span className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                          {objSuggestion.strTypePlace && (
                            <span className="font-semibold text-muted-foreground bg-secondary-fund px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
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
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground shadow-xl">
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
              <button type="button" onClick={() => toggleOperation(strOperationOption)} className="hover:text-destructive font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded-full px-1">✕</button>
            </span>
          ))}
          {strPropertyType && (
            <span key={strPropertyType} className={strChipClass}>
              {strPropertyType}
              <button type="button" onClick={() => setStrPropertyType(null)} className="hover:text-destructive font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded-full px-1">✕</button>
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
            className="rounded-lg text-xs bg-secondary text-secondary-foreground transition-all duration-300 hover:bg-secondary/90 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund"
            >
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={() => handleSearch(true)}
            className="rounded-lg text-xs bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund"
            >
            Avanzado
          </Button>
        </div>
      </div>
    </div>
  );
}