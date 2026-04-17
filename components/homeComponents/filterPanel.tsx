/**
 * Dev: Gonzales Hetor     Fecha: 25/03/2026
 * Dev: Jose Alvarez      Fecha: 25/03/2026
 * Funcionalidad: Panel del Filtro en la pagina del home.
 * Funcionalidad: Panel del Filtro en la pagina del home con cierre al clic externo.
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { useCitySearch } from "../hooks/useCitySearch";
import { useHoverAnimation } from "../hooks/useHoverAnimation";

import GenericDropdown from "./filterPanelSubcomponents/genericDropdown";
import CitySearchInput from "./filterPanelSubcomponents/citySearchInput";

const arrOperationOptions = ["Venta", "Alquiler", "Anticrético"];
const arrPropertyTypes = ["Casa", "Departamento", "Cuarto", "Terreno", "Espacio de cementerio"];

export default function FilterPanel() {
  const objRouter = useRouter();
  const objPanelRef = useRef<HTMLDivElement>(null); 

  const [arrOperations, setArrOperations] = useState<string[]>([]);
  const [strPropertyType, setStrPropertyType] = useState<string | null>(null);
  const [strOpenDropdown, setStrOpenDropdown] = useState<"operation" | "type" | null>(null);

  const citySearchHook = useCitySearch(); 

  const actionBtnHover = useHoverAnimation(false, false, 'pointer'); 
  const chipBtnHover = useHoverAnimation(true, true, 'pointer'); 

  useEffect(() => {
    const handleClickOutside = (objEvent: MouseEvent) => {
      if (objPanelRef.current && !objPanelRef.current.contains(objEvent.target as Node)) {
        setStrOpenDropdown(null);
        citySearchHook.setBolShowSuggestions(false);
        citySearchHook.setBolNoResults(false);
        citySearchHook.setBolShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [citySearchHook.setBolShowSuggestions, citySearchHook.setBolNoResults, citySearchHook.setBolShowHistory]);

  const toggleOperation = useCallback((strVal: string) => {
    setArrOperations((arrPrev) =>
      arrPrev.includes(strVal) ? arrPrev.filter((strItem) => strItem !== strVal) : [...arrPrev, strVal]
    );
  }, []);

  const handleSearch = useCallback((bolAvanzado = false, ciudadSeleccionada = citySearchHook.strCity) => {
    const objParams = new URLSearchParams();
    if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
    if (strPropertyType) objParams.set("tipo", strPropertyType);
    if (ciudadSeleccionada.trim()) objParams.set("ciudad", ciudadSeleccionada.trim());
    if (bolAvanzado) objParams.set("avanzado", "true");

    const strQuery = objParams.toString();
    objRouter.push(strQuery ? `/busqueda?${strQuery}` : "/busqueda");
    
    setStrOpenDropdown(null);
    citySearchHook.setBolShowSuggestions(false);
    citySearchHook.setBolShowHistory(false);
  }, [arrOperations, strPropertyType, citySearchHook, objRouter]);

  const strChipClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background border border-border text-foreground animate-in fade-in duration-200 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-secondary-fund";

  return (
    <div ref={objPanelRef} className="w-full flex flex-col gap-3 font-geist">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 p-3 md:px-3 md:py-2 rounded-2xl md:rounded-full bg-secondary-fund border border-border shadow-xl">
        
        {/* dropdown operación */}
        <GenericDropdown
          strDisplayText={arrOperations.length > 0 ? `Operación (${arrOperations.length})` : "Seleccionar Operación"}
          arrOptions={arrOperationOptions}
          arrSelectedValues={arrOperations}
          bolIsOpen={strOpenDropdown === "operation"}
          fnToggleOpen={() => setStrOpenDropdown(strOpenDropdown === "operation" ? null : "operation")}
          fnOnSelect={toggleOperation}
          bolIsMultiple={true}
        />

        <div className="h-px w-full md:w-px md:h-5 bg-border flex-shrink-0" />

        {/* dropdown tipo de inmueble */}
        <GenericDropdown
          strDisplayText={strPropertyType ?? "Seleccionar Inmueble"}
          arrOptions={arrPropertyTypes}
          arrSelectedValues={strPropertyType ? [strPropertyType] : []}
          bolIsOpen={strOpenDropdown === "type"}
          fnToggleOpen={() => setStrOpenDropdown(strOpenDropdown === "type" ? null : "type")}
          fnOnSelect={(strVal) => { 
            setStrPropertyType(strVal); 
            setStrOpenDropdown(null); 
          }}
          bolIsMultiple={false}
        />

        <div className="h-px w-full md:w-px md:h-5 bg-border flex-shrink-0" />

        {/* buscador de ciudades */}
        <CitySearchInput 
          hookData={citySearchHook}
          fnOnSearch={handleSearch}
        />
      </div>  

      {/* chips de filtros activos */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap gap-2">
          {arrOperations.map((strOperationOption) => (
            <span key={strOperationOption} className={strChipClass}>
              {strOperationOption}
              <button type="button" onClick={() => toggleOperation(strOperationOption)} className={`hover:text-destructive font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded-full px-1 ${chipBtnHover}`}>✕</button>
            </span>
          ))}
          {strPropertyType && (
            <span key={strPropertyType} className={strChipClass}>
              {strPropertyType}
              <button type="button" onClick={() => setStrPropertyType(null)} className={`hover:text-destructive font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded-full px-1 ${chipBtnHover}`}>✕</button>
            </span>
          )}
        </div>

        {/* botones limpiar / avanzado */}
        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            size="sm"
            onClick={() => {
              setArrOperations([]);
              setStrPropertyType(null);
              citySearchHook.setStrCity("");
            }}
            className={`rounded-lg text-xs bg-secondary text-secondary-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${actionBtnHover}`}
            >
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={() => handleSearch(true)}
            className={`rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${actionBtnHover}`}
            >
            Avanzado
          </Button>
        </div>
      </div>
    </div>
  );
}