/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 19/04/2026
 * Panel lateral para visualizar y gestionar el historial completo de busqueda de ciudades.
 * Implementa un trap de foco para accesibilidad y navegacion fluida por teclado
 * @param hookData Datos y funciones expuestas por el hook useCitySearch para la gestion del estado
 * @param strSuggestionHover Clases de estilo para el efecto hover de los elementos de la lista
 * @return Elemento JSX que renderiza el panel lateral con overlay
 */
import { useEffect, useRef, useState } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import CityListItem from "./CityListItem";
import ConfirmDeleteHistoryModal from "./ConfirmDeleteHistoryModal";

interface FullHistoryPanelProps {
  hookData: ReturnType<typeof useCitySearch>;
  strSuggestionHover: string;
}

export default function FullHistoryPanel({
  hookData,
  strSuggestionHover,
}: FullHistoryPanelProps) {
  const objFullPanelRef = useRef<HTMLDivElement | null>(null);
  const objActiveItemRef = useRef<HTMLElement | null>(null);

  const {
    arrHistory,
    intSelectedIndex,
    setIntSelectedIndex,
    setBolShowFullHistoryPanel,
    handleFillFromHistory,
    handleDeleteHistoryItem,
  } = hookData;

  type HistoryItem = ReturnType<typeof useCitySearch>["arrHistory"][number];

  const [objHistoryItemToDelete, setObjHistoryItemToDelete] =
    useState<HistoryItem | null>(null);

  const intSelectedIndexRef = useRef(intSelectedIndex);

  useEffect(() => {
    intSelectedIndexRef.current = intSelectedIndex;
  }, [intSelectedIndex]);

  useEffect(() => {
    const strOriginalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setIntSelectedIndex(0);

    const handleFocusTrap = (objEvent: KeyboardEvent) => {
      if (!objFullPanelRef.current) return;

      if (objHistoryItemToDelete) {
        return;
      }

      if (objEvent.key === "Escape") {
        setBolShowFullHistoryPanel(false);
        return;
      }

      if (["ArrowDown", "ArrowUp"].includes(objEvent.key)) {
        objEvent.preventDefault();

        const intMaxIndex = arrHistory.length - 1;

        if (objEvent.key === "ArrowDown") {
          setIntSelectedIndex((intPrev) =>
            intPrev < intMaxIndex ? intPrev + 1 : 0
          );
        } else {
          setIntSelectedIndex((intPrev) =>
            intPrev > 0 ? intPrev - 1 : intMaxIndex
          );
        }

        return;
      }

      if (objEvent.key === "Enter") {
        const intCurrentIndex = intSelectedIndexRef.current;

        if (intCurrentIndex >= 0 && arrHistory[intCurrentIndex]) {
          objEvent.preventDefault();
          handleFillFromHistory(arrHistory[intCurrentIndex]);
          setBolShowFullHistoryPanel(false);
        }

        return;
      }

      if (objEvent.key === "Tab") {
        const arrFocusableElements =
          objFullPanelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

        if (arrFocusableElements.length === 0) return;

        const objFirstElement = arrFocusableElements[0];
        const objLastElement =
          arrFocusableElements[arrFocusableElements.length - 1];

        if (objEvent.shiftKey) {
          if (
            document.activeElement === objFirstElement ||
            document.activeElement === document.body
          ) {
            objLastElement.focus();
            objEvent.preventDefault();
          }
        } else {
          if (document.activeElement === objLastElement) {
            objFirstElement.focus();
            objEvent.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap, true);

    setTimeout(() => {
      if (objFullPanelRef.current) {
        objFullPanelRef.current.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = strOriginalOverflow;
      document.removeEventListener("keydown", handleFocusTrap, true);
    };
  }, [
    arrHistory,
    handleFillFromHistory,
    objHistoryItemToDelete,
    setBolShowFullHistoryPanel,
    setIntSelectedIndex,
  ]);

  useEffect(() => {
    if (objActiveItemRef.current) {
      objActiveItemRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [intSelectedIndex]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-[95] animate-in fade-in duration-300"
        aria-hidden="true"
        onClick={() => {
          if (!objHistoryItemToDelete) {
            setBolShowFullHistoryPanel(false);
          }
        }}
      />

      <div
        ref={objFullPanelRef}
        tabIndex={-1}
        // border-border unificado a border-card-border
        className="fixed top-0 left-0 h-full z-[100] w-full landscape:max-sm:w-[85%] sm:w-[85%] md:w-[35%] bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-card-border focus:outline-none"
      >
        {/* border-border unificado a border-card-border */}
        <div className="p-4 border-b border-card-border flex justify-between items-center bg-background">
          <h2 className="font-semibold text-sm text-foreground">
            Historial de Búsqueda
          </h2>
          
          <button
            onClick={() => setBolShowFullHistoryPanel(false)}
            // Clases muted y muted-foreground cambiadas a tus colores globales (secondary-fund y foreground/60)
            className="p-1.5 rounded-md text-foreground/60 hover:bg-secondary-fund hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Cerrar panel de historial"
          >
            <img 
              src="/xicon.svg" 
              alt="Cerrar" 
              width={20} 
              height={20} 
              // Se añade svg-theme-invert para que invierta el color en Modo Oscuro si es necesario
              className="opacity-70 hover:opacity-100 transition-opacity svg-theme-invert"
            />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto py-2 scrollbar-custom">
          {arrHistory.map((objItem, intIndex) => (
            <CityListItem
              key={`full-hist-${objItem.strId}`}
              objItem={objItem}
              bolIsSelected={intSelectedIndex === intIndex}
              objItemRef={
                intSelectedIndex === intIndex ? objActiveItemRef : null
              }
              strSuggestionHover={strSuggestionHover}
              fnOnMouseEnter={() => setIntSelectedIndex(intIndex)}
              fnOnSelect={() => {
                handleFillFromHistory(objItem);
                setBolShowFullHistoryPanel(false);
              }}
              fnOnDelete={(objEvent) => {
                objEvent.preventDefault();
                objEvent.stopPropagation();
                setObjHistoryItemToDelete(objItem);
              }}
            />
          ))}
        </ul>
      </div>

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