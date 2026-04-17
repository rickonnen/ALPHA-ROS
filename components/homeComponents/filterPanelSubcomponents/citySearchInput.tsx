/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 16/04/2026
 * funcionalidad: componente de entrada de texto para la búsqueda de ciudades.
 * maneja sugerencias de mapbox y el historial de búsquedas recientes
 * @param hookData objeto devuelto por el hook useCitySearch que contiene estados y manejadores
 * @param fnOnSearch función callback que se ejecuta al realizar una búsqueda (click o enter)
 * @return elemento jsx que representa el buscador de ciudades con autocompletado
 */
"use client";

import { useEffect, useRef } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import { useHoverAnimation } from "../../hooks/useHoverAnimation";

interface CitySearchInputProps {
  hookData: ReturnType<typeof useCitySearch>;
  fnOnSearch: (bolAvanzado?: boolean, strCiudad?: string) => void;
}

export default function CitySearchInput({ hookData, fnOnSearch }: CitySearchInputProps) {
  const objActiveItemRef = useRef<HTMLLIElement>(null);

  const {
    strCity,
    arrSuggestions,
    bolShowSuggestions,
    bolNoResults,
    intSelectedIndex,
    setIntSelectedIndex,
    intMaxCityLength,
    arrHistory,
    bolShowHistory,
    handleInputFocus,
    handleCityChange,
    handleSelectSuggestion,
    handleKeyDown,
  } = hookData;

  const inputHover = useHoverAnimation(false, false, 'text');
  const searchBtnHover = useHoverAnimation(false, false, 'pointer');
  const suggestionHover = useHoverAnimation(true, true, 'pointer', true, false);

  // efecto para desplazar la vista automáticamente hacia la sugerencia seleccionada con las flechas
  useEffect(() => {
    if (objActiveItemRef.current) {
      objActiveItemRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [intSelectedIndex]);

  return (
    <div className="relative flex flex-1 items-center gap-2 px-1">
      <input
        type="text"
        placeholder="Buscar por..."
        className={`flex-1 bg-transparent px-2 py-2 md:py-0 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund rounded-md text-foreground placeholder:text-muted-foreground ${inputHover}`}
        value={strCity}
        maxLength={intMaxCityLength}
        onChange={(objEvent) => handleCityChange(objEvent.target.value)}
        onFocus={handleInputFocus}
        onKeyDown={(objEvent) => {
          const bolIsSuggestionsActive = bolShowSuggestions && arrSuggestions.length > 0;
          const bolIsHistoryActive = bolShowHistory && arrHistory.length > 0 && !bolShowSuggestions && strCity.trim().length < 2;

          // manejo de teclas de navegación cuando hay listas desplegadas
          if (bolIsSuggestionsActive || bolIsHistoryActive) {
            if (["ArrowDown", "ArrowUp", "Escape"].includes(objEvent.key)) {
              handleKeyDown(objEvent as any);
              return;
            }

            // selección de sugerencia activa con enter
            if (objEvent.key === "Enter") {
              objEvent.preventDefault();
              const arrCurrentList = bolIsSuggestionsActive ? arrSuggestions : arrHistory.slice(0, 5);

              if (intSelectedIndex >= 0 && arrCurrentList[intSelectedIndex]) {
                const objSelectedItem = arrCurrentList[intSelectedIndex];
                handleSelectSuggestion(objSelectedItem);
                fnOnSearch(false, objSelectedItem.strName);
              } else {
                fnOnSearch(false);
              }
              return;
            }
          } else if (objEvent.key === "Enter") {
            objEvent.preventDefault();
            fnOnSearch(false);
          }
        }}
      />

      <button
        type="button"
        onClick={() => fnOnSearch(false)}
        className={`flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full bg-primary hover:bg-primary flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${searchBtnHover}`}
      >
        <svg className="w-5 h-5 md:w-4 md:h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
      </button>

      {/* sugerencias de mapbox */}
      {bolShowSuggestions && (
        <ul className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background rounded-xl border border-border shadow-2xl overflow-y-auto py-1 max-h-[120px] md:max-h-[180px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
          {arrSuggestions.map((objSuggestion, intIndex) => {
            const arrParts = objSuggestion.strFullName.split(",");
            const strSecondary = arrParts.slice(1).join(",").replace(/Bolivia/gi, "").replace(/,\s*$/, "").trim();
            const bolIsSelected = intSelectedIndex === intIndex;

            return (
              <li
                key={objSuggestion.strId}
                ref={bolIsSelected ? objActiveItemRef : null}
                data-active={bolIsSelected}
                onMouseEnter={() => setIntSelectedIndex(intIndex)}
                onClick={() => {
                  handleSelectSuggestion(objSuggestion);
                  fnOnSearch(false, objSuggestion.strName);
                }}
                className={`flex items-center gap-3 px-3 py-2 mx-1 my-0.5 rounded-lg focus-visible:outline-none transition-colors ${
                  bolIsSelected ? "bg-secondary-fund" : "hover:bg-secondary-fund/60"
                } ${suggestionHover}`}
              >
                <img src={objSuggestion.strIcon} alt="BO" className="h-4 w-5 flex-shrink-0" />

                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-foreground truncate">{objSuggestion.strName}</span>

                  {(objSuggestion.strTypePlace || strSecondary) && (
                    <span className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                      {objSuggestion.strTypePlace && (
                        <span className="font-semibold text-muted-foreground bg-secondary-fund px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                          {objSuggestion.strTypePlace}
                        </span>
                      )}
                      {strSecondary && <span className="truncate">{strSecondary.replace(/^,\s*/, "")}</span>}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* historial reciente con navegación */}
      {bolShowHistory && arrHistory.length > 0 && !bolShowSuggestions && strCity.trim().length < 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background rounded-xl border border-border shadow-2xl overflow-y-auto scroll-pt-10 max-h-[120px] md:max-h-[180px] flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="px-4 py-2 text-xs font-semibold text-foreground/70 bg-background border-b border-border sticky top-0 z-10">
            historial:
          </div>

          <ul className="flex flex-col py-1">
            {arrHistory.slice(0, 5).map((objItem, intIndex) => {
              const arrParts = objItem.strFullName.split(",");
              const strSecondary = arrParts.slice(1).join(",").replace(/Bolivia/gi, "").replace(/,\s*$/, "").trim();

              const bolIsSelected = intSelectedIndex === intIndex;

              return (
                <li
                  key={`hist-${objItem.strId}`}
                  ref={bolIsSelected ? objActiveItemRef : null}
                  data-active={bolIsSelected}
                  onMouseEnter={() => setIntSelectedIndex(intIndex)}
                  onClick={() => {
                    handleSelectSuggestion(objItem);
                    fnOnSearch(false, objItem.strName);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 mx-1 my-0.5 rounded-lg focus-visible:outline-none transition-colors ${
                    bolIsSelected ? "bg-secondary-fund" : "hover:bg-secondary-fund/60"
                  } ${suggestionHover}`}
                >
                  <img src={objItem.strIcon} alt="BO" className="h-4 w-5 flex-shrink-0" />

                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-foreground truncate">{objItem.strName}</span>

                    {(objItem.strTypePlace || strSecondary) && (
                      <span className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                        {objItem.strTypePlace && (
                          <span className="font-semibold text-muted-foreground bg-secondary-fund px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                            {objItem.strTypePlace}
                          </span>
                        )}
                        {strSecondary && <span className="truncate">{strSecondary.replace(/^,\s*/, "")}</span>}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* mensaje sin resultados */}
      {bolNoResults && strCity.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground shadow-xl">
          no se encontraron resultados
        </div>
      )}
    </div>
  );
}