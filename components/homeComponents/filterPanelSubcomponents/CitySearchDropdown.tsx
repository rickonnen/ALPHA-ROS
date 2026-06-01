/**
 * Autor: Jose Daniel Condarco Flores
 * Componente: CitySearchDropdown
 * fecha: 19/4/2026
 * Funcion: Muestra sugerencias, historial y controla la seleccion de ciudades.
 */
import { RefObject, useState } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import CityListItem from "./CityListItem";
import ConfirmDeleteHistoryModal from "./ConfirmDeleteHistoryModal";

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
  bolIsHistoryActive,
}: CitySearchDropdownProps) {
  const {
    strCity,
    arrSuggestions,
    bolShowSuggestions,
    bolNoResults,
    intSelectedIndex,
    setIntSelectedIndex,
    arrHistory,
    handleFillFromHistory,
    handleSelectSuggestion,
    handleDeleteHistoryItem,
    bolIsAuthenticated,
    setBolShowFullHistoryPanel,
  } = hookData;

  type HistoryItem = ReturnType<typeof useCitySearch>["arrHistory"][number];

  const [objHistoryItemToDelete, setObjHistoryItemToDelete] =
    useState<HistoryItem | null>(null);

  const intVerMasIndex = arrHistory.slice(0, 5).length;
  const bolVerMasSelected =
    bolIsHistoryActive && intSelectedIndex === intVerMasIndex;

  return (
    <>
      {bolShowSuggestions && (
        <ul className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-secondary-fund rounded-xl border border-card-border shadow-2xl overflow-y-auto py-1 max-h-[120px] md:max-h-[180px] scrollbar-custom">
          {arrSuggestions.map((objSuggestion, intIndex) => (
            <CityListItem
              key={objSuggestion.strId}
              objItem={objSuggestion}
              bolIsSelected={intSelectedIndex === intIndex}
              objItemRef={
                intSelectedIndex === intIndex ? objActiveItemRef : null
              }
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

      {bolIsHistoryActive && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full  bg-secondary-fund rounded-xl border border-card-border shadow-2xl overflow-y-auto scroll-pt-10 max-h-[120px] md:max-h-[180px] flex flex-col scrollbar-custom">
          <div className="px-4 py-2 text-xs font-semibold text-foreground/70  bg-secondary-fund border-b border-card-border sticky top-0 z-10">
            historial:
          </div>

          <ul className="flex flex-col py-1">
            {arrHistory.slice(0, 5).map((objItem, intIndex) => (
              <CityListItem
                key={`hist-${objItem.strId}`}
                objItem={objItem}
                bolIsSelected={intSelectedIndex === intIndex}
                objItemRef={
                  intSelectedIndex === intIndex ? objActiveItemRef : null
                }
                strSuggestionHover={strSuggestionHover}
                fnOnMouseEnter={() => setIntSelectedIndex(intIndex)}
                fnOnSelect={() => {
                  handleFillFromHistory(objItem);
                }}
                fnOnDelete={(objEvent) => {
                  objEvent.preventDefault();
                  objEvent.stopPropagation();
                  setObjHistoryItemToDelete(objItem);
                }}
              />
            ))}

            {bolIsAuthenticated && (
              <li className="w-full mt-1 border-t border-card-border px-1">
                <button
                  type="button"
                  ref={
                    bolVerMasSelected
                      ? (objActiveItemRef as RefObject<HTMLButtonElement>)
                      : null
                  }
                  data-active={bolVerMasSelected}
                  onMouseEnter={() => setIntSelectedIndex(intVerMasIndex)}
                  className={`flex justify-center items-center w-full py-2.5 rounded-lg transition-all focus-visible:outline-none ${
                    bolVerMasSelected
                      ? "bg-secondary-fund shadow-[0_4px_15px_rgba(0,0,0,0.1)] scale-[1.01]"
                      : "hover:bg-secondary-fund/60 border-transparent"
                  } ${strSuggestionHover}`}
                  onClick={(objEvent) => {
                    objEvent.preventDefault();
                    setBolShowFullHistoryPanel(true);
                    hookData.setBolShowHistory(false);
                    setIntSelectedIndex(-1);
                  }}
                >
                  <span className="text-xs font-bold text-primary pointer-events-none">
                    ver mas
                  </span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {bolNoResults && strCity.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full  bg-secondary-fund border border-card-border rounded-xl p-3 text-sm text-foreground shadow-xl">
          no se encontraron resultados
        </div>
      )}

      <ConfirmDeleteHistoryModal
        bolOpen={Boolean(objHistoryItemToDelete)}
        strItemName={objHistoryItemToDelete?.strName}
        fnOnCancel={() => {
          setObjHistoryItemToDelete(null);
        }}
        fnOnAccept={() => {
          if (!objHistoryItemToDelete) return;

          handleDeleteHistoryItem(objHistoryItemToDelete.strId);
          setObjHistoryItemToDelete(null);
          setIntSelectedIndex(-1);
        }}
      />
    </>
  );
}