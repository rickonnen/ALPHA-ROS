/**
 * Autor: Jose Daniel Condarco Flores
 * Componente: CitySearchDropdown
 * fecha: 19/4/2026
 * Función: Muestra sugerencias, historial y controla la selección de ciudades.
 */
import { RefObject } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import CityListItem from "./CityListItem";

interface CitySearchDropdownProps {
  hookData: ReturnType<typeof useCitySearch>;
  fnOnSearch: (bolAvanzado?: boolean, strCiudad?: string) => void;
  objActiveItemRef: RefObject<HTMLElement | null>;
  strSuggestionHover: string;
  bolIsHistoryActive: boolean;
}

export default function CitySearchDropdown({
  hookData,
  fnOnSearch,
  objActiveItemRef,
  strSuggestionHover,
  bolIsHistoryActive
}: CitySearchDropdownProps) {
  const {
    strCity, arrSuggestions, bolShowSuggestions, bolNoResults,
    intSelectedIndex, setIntSelectedIndex,
    arrHistory, handleFillFromHistory, handleSelectSuggestion,
    bolIsAuthenticated, setBolShowFullHistoryPanel
  } = hookData;

  const intVerMasIndex = arrHistory.slice(0, 5).length;
  const bolVerMasSelected = bolIsHistoryActive && intSelectedIndex === intVerMasIndex;

  return (
    <>
      {/* 1. Sugerencias Mapbox */}
      {bolShowSuggestions && (
        <ul className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background rounded-xl border border-border shadow-2xl overflow-y-auto py-1 max-h-[120px] md:max-h-[180px] scrollbar-custom">
          {arrSuggestions.map((objSuggestion, intIndex) => (
            <CityListItem
              key={objSuggestion.strId}
              objItem={objSuggestion}
              bolIsSelected={intSelectedIndex === intIndex}
              objItemRef={intSelectedIndex === intIndex ? objActiveItemRef : null}
              strSuggestionHover={strSuggestionHover}
              fnOnMouseEnter={() => setIntSelectedIndex(intIndex)}
              fnOnSelect={() => {
                handleSelectSuggestion(objSuggestion);
                fnOnSearch(false, objSuggestion.strName);
              }}
            />
          ))}
        </ul>
      )}

      {/* 2. Historial Reciente */}
      {bolIsHistoryActive && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background rounded-xl border border-border shadow-2xl overflow-y-auto scroll-pt-10 max-h-[120px] md:max-h-[180px] flex flex-col scrollbar-custom">
          <div className="px-4 py-2 text-xs font-semibold text-foreground/70 bg-background border-b border-border sticky top-0 z-10">
            historial:
          </div>
          <ul className="flex flex-col py-1">
            {arrHistory.slice(0, 5).map((objItem, intIndex) => (
              <CityListItem
                key={`hist-${objItem.strId}`}
                objItem={objItem}
                bolIsSelected={intSelectedIndex === intIndex}
                objItemRef={intSelectedIndex === intIndex ? objActiveItemRef : null}
                strSuggestionHover={strSuggestionHover}
                fnOnMouseEnter={() => setIntSelectedIndex(intIndex)}
                fnOnSelect={() => handleFillFromHistory(objItem.strName)}
              />
            ))}

            {bolIsAuthenticated && (
              <li className="w-full mt-1 border-t border-border px-1">
                <button
                  type="button"
                  ref={bolVerMasSelected ? (objActiveItemRef as RefObject<HTMLButtonElement>) : null}
                  data-active={bolVerMasSelected}
                  onMouseEnter={() => setIntSelectedIndex(intVerMasIndex)}
                  className={`flex justify-center items-center w-full py-2.5 rounded-lg transition-all focus-visible:outline-none 
                    ${bolVerMasSelected ? "bg-secondary-fund shadow-[0_4px_15px_rgba(0,0,0,0.1)] scale-[1.01]" : "hover:bg-secondary-fund/60 border-transparent"} 
                    ${strSuggestionHover}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setBolShowFullHistoryPanel(true);
                    hookData.setBolShowHistory(false);
                    setIntSelectedIndex(-1);
                  }}
                >
                  <span className="text-xs font-bold text-primary pointer-events-none">ver más</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 3. Sin resultados */}
      {bolNoResults && strCity.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground shadow-xl">
          no se encontraron resultados
        </div>
      )}
    </>
  );
}