/**
 * Dev: Gonzales Hetor      Fecha: 25/03/2026
 * Dev: Jose Alvarez        Fecha: 25/03/2026
 * Funcionalidad: Panel del Filtro en la pagina del home.
 * Funcionalidad: Panel del Filtro en la pagina del home con cierre al clic externo y multiseleccion extendida.
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; 
import { useCitySearch } from "../hooks/useCitySearch";
import { useHoverAnimation } from "../hooks/useHoverAnimation";
import { useVerifyJWT } from "../hooks/useVerifyJWT"; 

import GenericDropdown from "./filterPanelSubcomponents/genericDropdown";
import CitySearchInput from "./filterPanelSubcomponents/citySearchInput";

const arrOperationOptions = ["Venta", "Alquiler", "Anticrético"];
const arrPropertyTypes = ["Casa", "Departamento", "Cuarto", "Terreno", "Espacio de cementerio"];

export default function filterPanel() {
  const objRouter = useRouter();
  const objPanelRef = useRef<HTMLDivElement>(null); 

  const [arrOperations, setArrOperations] = useState<string[]>([]);
  const [arrSelectedPropertyTypes, setArrSelectedPropertyTypes] = useState<string[]>([]);
  const [strOpenDropdown, setStrOpenDropdown] = useState<"operation" | "type" | null>(null);

  const { user: objUser, loading: bolIsAuthLoading } = useVerifyJWT();

  const objCitySearchHook = useCitySearch({ 
    objUser, 
    bolIsAuthLoading 
  }); 

  const strActionBtnHover = useHoverAnimation(false, false, 'pointer'); 
  const strChipBtnHover = useHoverAnimation(true, true, 'pointer'); 

  useEffect(() => {
    const fnHandleClickOutside = (objEvent: MouseEvent) => {
      if (objPanelRef.current && !objPanelRef.current.contains(objEvent.target as Node)) {
        setStrOpenDropdown(null);
        objCitySearchHook.setBolShowSuggestions(false);
        objCitySearchHook.setBolNoResults(false);
        objCitySearchHook.setBolShowHistory(false);
      }
    };
    document.addEventListener("mousedown", fnHandleClickOutside);
    return () => document.removeEventListener("mousedown", fnHandleClickOutside);
  }, [objCitySearchHook.setBolShowSuggestions, objCitySearchHook.setBolNoResults, objCitySearchHook.setBolShowHistory]);

  const fnToggleOperation = useCallback((strVal: string) => {
    setArrOperations((arrPrev) =>
      arrPrev.includes(strVal) ? arrPrev.filter((strItem) => strItem !== strVal) : [...arrPrev, strVal]
    );
  }, []);

  const fnTogglePropertyType = useCallback((strVal: string) => {
    setArrSelectedPropertyTypes((arrPrev) =>
      arrPrev.includes(strVal) ? arrPrev.filter((strItem) => strItem !== strVal) : [...arrPrev, strVal]
    );
  }, []);

  const fnHandleSearch = useCallback((bolIsAdvanced = false, strSelectedCity = objCitySearchHook.strCity) => {
    const objParams = new URLSearchParams();
    if (arrOperations.length > 0) objParams.set("operaciones", arrOperations.join(","));
    if (arrSelectedPropertyTypes.length > 0) objParams.set("tipo", arrSelectedPropertyTypes.join(","));
    if (strSelectedCity.trim()) objParams.set("ciudad", strSelectedCity.trim());
    if (bolIsAdvanced) objParams.set("avanzado", "true");
    
    if (strSelectedCity.trim() && arrOperations.length > 0) {
      for (const strOp of arrOperations) {
        fetch("/api/home/reporte", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lugar: strSelectedCity.trim(),
            operacion: strOp.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""),
          }),
        }).catch(() => {});
      }
    }

    const strQuery = objParams.toString();
    objRouter.push(strQuery ? `/busqueda?${strQuery}` : "/busqueda");
    
    setStrOpenDropdown(null);
    objCitySearchHook.setBolShowSuggestions(false);
    objCitySearchHook.setBolShowHistory(false);
  }, [arrOperations, arrSelectedPropertyTypes, objCitySearchHook, objRouter]);

  // Nota: Los cálculos en esta función DEBEN mantenerse en píxeles (no rem) 
  // porque la API nativa del navegador (window.scrollY y getBoundingClientRect) 
  // devuelve y requiere valores estrictamente en píxeles para funcionar.
  const fnHandleSearchInteraction = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 800 && objPanelRef.current) {
      const objRect = objPanelRef.current.getBoundingClientRect();
      const intScrollY = window.scrollY || document.documentElement.scrollTop;
      const intTargetY = intScrollY + objRect.top - (window.innerHeight * 0.20);
      
      window.scrollTo({
        top: intTargetY,
        behavior: "smooth"
      });
    }
  }, []);

  // Clases actualizadas respetando tus variables de globals.css
  const strChipClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background border border-card-border text-foreground animate-in fade-in duration-200 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-secondary-fund";

  return (
    <div ref={objPanelRef} className="w-full flex flex-col gap-3 font-sans">
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 p-3 md:px-3 md:py-2 rounded-2xl md:rounded-full bg-secondary-fund border border-card-border shadow-xl">
        
        <GenericDropdown
          strDisplayText={arrOperations.length > 0 ? `Operación (${arrOperations.length})` : "Seleccionar Operación"}
          arrOptions={arrOperationOptions}
          arrSelectedValues={arrOperations}
          bolIsOpen={strOpenDropdown === "operation"}
          fnToggleOpen={() => setStrOpenDropdown(strOpenDropdown === "operation" ? null : "operation")}
          fnOnSelect={fnToggleOperation}
          bolIsMultiple={true}
        />

        {/* Separadores visuales */}
        <div className="h-px w-full md:w-px md:h-5 bg-card-border flex-shrink-0" />

        <GenericDropdown
          strDisplayText={arrSelectedPropertyTypes.length > 0 ? `Inmueble (${arrSelectedPropertyTypes.length})` : "Seleccionar Inmueble"}
          arrOptions={arrPropertyTypes}
          arrSelectedValues={arrSelectedPropertyTypes}
          bolIsOpen={strOpenDropdown === "type"}
          fnToggleOpen={() => setStrOpenDropdown(strOpenDropdown === "type" ? null : "type")}
          fnOnSelect={fnTogglePropertyType}
          bolIsMultiple={true}
        />

        <div className="h-px w-full md:w-px md:h-5 bg-card-border flex-shrink-0" />

        <div 
          className="w-full flex-1" 
          onClickCapture={fnHandleSearchInteraction} 
          onFocusCapture={fnHandleSearchInteraction}
        >
          <CitySearchInput 
            hookData={objCitySearchHook}
            fnOnSearch={fnHandleSearch}
          />
        </div>
      </div>  

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap gap-2">
          {arrOperations.map((strOperationOption) => (
            <span key={`op-${strOperationOption}`} className={strChipClass}>
              {strOperationOption}
              {/* text-destructive reemplazado por text-secondary (tu Terracota/Verde oscuro) */}
              <button 
                type="button" 
                onClick={() => fnToggleOperation(strOperationOption)} 
                className={`hover:text-secondary font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-full px-1 ${strChipBtnHover}`}
              >
                ✕
              </button>
            </span>
          ))}
          {arrSelectedPropertyTypes.map((strTypeOption) => (
            <span key={`type-${strTypeOption}`} className={strChipClass}>
              {strTypeOption}
              <button 
                type="button" 
                onClick={() => fnTogglePropertyType(strTypeOption)} 
                className={`hover:text-secondary font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-full px-1 ${strChipBtnHover}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            size="sm"
            onClick={() => {
              setArrOperations([]);
              setArrSelectedPropertyTypes([]);
              objCitySearchHook.setStrCity("");
            }}
            className={`rounded-lg text-xs bg-secondary text-secondary-foreground hover:bg-secondary hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strActionBtnHover}`}
            >
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={() => fnHandleSearch(true)}
            className={`rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strActionBtnHover}`}
            >
            Avanzado
          </Button>
        </div>
      </div>
    </div>
  );
}