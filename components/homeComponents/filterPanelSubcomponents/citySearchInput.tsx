/**
 * Dev: Rodrigo Saul Zarate Villarroel       Fecha: 20/04/2026
 * Componente de entrada de búsqueda para ciudades con soporte de autocompletado e historial.
 * Gestiona la navegación por teclado y coordina la visualización de paneles desplegables.
 * @param hookData Datos y métodos provenientes del hook centralizado useCitySearch
 * @param fnOnSearch Función callback para ejecutar la navegación o búsqueda activa
 * @return Elemento JSX con input, botón de búsqueda y orquestación de menús
 */
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import { useHoverAnimation } from "../../hooks/useHoverAnimation";
import { useClickOutside } from "../../hooks/useClickOutside"; 

import CitySearchDropdown from "./CitySearchDropdown";
import FullHistoryPanel from "./FullHistoryPanel";

interface CitySearchInputProps {
  hookData: ReturnType<typeof useCitySearch>;
  fnOnSearch: (bolAvanzado?: boolean, strCiudad?: string) => void;
}

export default function CitySearchInput({ hookData, fnOnSearch }: CitySearchInputProps) {
  const objContainerRef = useRef<HTMLDivElement>(null);
  const objActiveItemRef = useRef<HTMLElement>(null);

  const {
    strCity, arrSuggestions, bolShowSuggestions, 
    intSelectedIndex, setIntSelectedIndex, intMaxCityLength,
    arrHistory, bolShowHistory, handleInputFocus, handleCityChange,
    handleFillFromHistory, handleSelectSuggestion,
    bolIsAuthenticated, bolShowFullHistoryPanel, setBolShowFullHistoryPanel
  } = hookData;

  const strInputHover = useHoverAnimation(false, true, 'pointer', true, false);
  const strSearchBtnHover = useHoverAnimation(true, true, 'pointer', true, false);
  const strSuggestionHover = useHoverAnimation(true, true, 'pointer', true, false);

  const bolIsSuggestionsActive = bolShowSuggestions && arrSuggestions.length > 0;
  const bolIsHistoryActive = bolShowHistory && arrHistory.length > 0 && !bolShowSuggestions && strCity.trim().length < 2;

  // Cierre externo
  const handleCloseDropdowns = useCallback(() => {
    hookData.setBolShowSuggestions(false);
    hookData.setBolShowHistory(false);
    hookData.setBolNoResults(false);
  }, [hookData]);

  // Usamos el hook y evitamos bloquear el scroll para el input
  useClickOutside(
    [objContainerRef], 
    handleCloseDropdowns, 
    { enabled: bolIsSuggestionsActive || bolIsHistoryActive, lockScroll: false }
  );

  // Auto-scroll del input
  useEffect(() => {
    if (objActiveItemRef.current) {
      objActiveItemRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [intSelectedIndex]);

  // Navegación por teclado
  const handleInputKeyDown = (objEvent: React.KeyboardEvent<HTMLInputElement>) => {
    if (bolIsSuggestionsActive || bolIsHistoryActive) {
      
      if (["ArrowDown", "ArrowUp"].includes(objEvent.key)) {
        objEvent.preventDefault();
        let intMaxIndex = 0;
        
        if (bolIsSuggestionsActive) {
          intMaxIndex = arrSuggestions.length - 1;
        } else if (bolIsHistoryActive) {
          const intVisibleHistory = arrHistory.slice(0, 5).length;
          intMaxIndex = bolIsAuthenticated ? intVisibleHistory : intVisibleHistory - 1;
        }

        if (objEvent.key === "ArrowDown") {
          setIntSelectedIndex((intPrev) => (intPrev < intMaxIndex ? intPrev + 1 : 0));
        } else {
          setIntSelectedIndex((intPrev) => (intPrev > 0 ? intPrev - 1 : intMaxIndex));
        }
        return;
      }

      if (objEvent.key === "Escape") {
        handleCloseDropdowns();
        setIntSelectedIndex(-1);
        return;
      }

      if (objEvent.key === "Enter") {
        objEvent.preventDefault();
        let arrCurrentList = bolIsSuggestionsActive ? arrSuggestions : arrHistory.slice(0, 5);

        if (bolIsHistoryActive && bolIsAuthenticated && intSelectedIndex === arrCurrentList.length) {
          setBolShowFullHistoryPanel(true);
          hookData.setBolShowHistory(false);
          setIntSelectedIndex(-1);
          return;
        }

        if (intSelectedIndex >= 0 && intSelectedIndex < arrCurrentList.length && arrCurrentList[intSelectedIndex]) {
          const objSelectedItem = arrCurrentList[intSelectedIndex];
          if (bolIsSuggestionsActive) {
            handleSelectSuggestion(objSelectedItem);
            fnOnSearch(false, objSelectedItem.strName);
          } else {
            handleFillFromHistory(objSelectedItem); 
          }
        } else {
          fnOnSearch(false);
        }
        return;
      }
    } else if (objEvent.key === "Enter") {
      objEvent.preventDefault();
      fnOnSearch(false);
    }
  };

  return (
    <>
      <div ref={objContainerRef} className="relative flex flex-1 items-center gap-2 px-1">
        <input
          type="text"
          placeholder="Buscar por..."
          className={`flex-1 bg-transparent px-2 py-2 md:py-0 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund rounded-md text-foreground placeholder:text-foreground/40 transition-colors ${strInputHover}`}
          value={strCity}
          maxLength={intMaxCityLength}
          onChange={(objEvent) => handleCityChange(objEvent.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
        />

        <button
          type="button"
          onClick={() => fnOnSearch(false)}
          className={`flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full bg-primary hover:bg-primary hover:brightness-90 flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund transition-all ${strSearchBtnHover}`}
        >
          <svg className="w-5 h-5 md:w-4 md:h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
        </button>

        <CitySearchDropdown 
          hookData={hookData}
          fnOnSearch={fnOnSearch}
          objActiveItemRef={objActiveItemRef}
          strSuggestionHover={strSuggestionHover}
          bolIsHistoryActive={bolIsHistoryActive}
        />
      </div>

      {bolShowFullHistoryPanel && (
        <FullHistoryPanel 
          hookData={hookData} 
          strSuggestionHover={strSuggestionHover} 
        />
      )}
    </>
  );
}