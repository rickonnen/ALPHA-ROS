/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 19/04/2026
 * Panel lateral para visualizar y gestionar el historial completo de búsqueda de ciudades.
 * Implementa un trap de foco para accesibilidad y navegación fluida por teclado
 * @param hookData Datos y funciones expuestas por el hook useCitySearch para la gestión del estado
 * @param strSuggestionHover Clases de estilo para el efecto hover de los elementos de la lista
 * @return Elemento JSX que renderiza el panel lateral con overlay
 */
import { useEffect, useRef } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import CityListItem from "./CityListItem";
import { useClickOutside } from "../../hooks/useClickOutside";

interface FullHistoryPanelProps {
  hookData: ReturnType<typeof useCitySearch>;
  strSuggestionHover: string;
}

export default function FullHistoryPanel({ hookData, strSuggestionHover }: FullHistoryPanelProps) {
  const objFullPanelRef = useRef<HTMLDivElement>(null);
  const objActiveItemRef = useRef<HTMLElement>(null);

  const {
    arrHistory, intSelectedIndex, setIntSelectedIndex,
    setBolShowFullHistoryPanel, handleFillFromHistory, handleDeleteHistoryItem
  } = hookData;

  // cerrar al hacer clic fuera
  useClickOutside([objFullPanelRef], () => setBolShowFullHistoryPanel(false));

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

      if (objEvent.key === 'Escape') {
        setBolShowFullHistoryPanel(false);
        return;
      }

      if (["ArrowDown", "ArrowUp"].includes(objEvent.key)) {
        objEvent.preventDefault();
        const intMaxIndex = arrHistory.length - 1;
        if (objEvent.key === "ArrowDown") {
          setIntSelectedIndex((intPrev) => (intPrev < intMaxIndex ? intPrev + 1 : 0));
        } else {
          setIntSelectedIndex((intPrev) => (intPrev > 0 ? intPrev - 1 : intMaxIndex));
        }
        return;
      }

      if (objEvent.key === "Enter") {
        const intCurrentIndex = intSelectedIndexRef.current;
        if (intCurrentIndex >= 0 && arrHistory[intCurrentIndex]) {
          objEvent.preventDefault();
          handleFillFromHistory(arrHistory[intCurrentIndex].strName);
          setBolShowFullHistoryPanel(false);
        }
        return;
      }

      if (objEvent.key === 'Tab') {
        const arrFocusableElements = objFullPanelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (arrFocusableElements.length === 0) return;
        const objFirstElement = arrFocusableElements[0];
        const objLastElement = arrFocusableElements[arrFocusableElements.length - 1];

        if (objEvent.shiftKey) { 
          if (document.activeElement === objFirstElement || document.activeElement === document.body) {
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

    document.addEventListener('keydown', handleFocusTrap, true);
    setTimeout(() => {
       if (objFullPanelRef.current) objFullPanelRef.current.focus(); 
    }, 50);

    return () => {
      document.body.style.overflow = strOriginalOverflow;
      document.removeEventListener('keydown', handleFocusTrap, true);
    };
  }, [setBolShowFullHistoryPanel, arrHistory, handleFillFromHistory, setIntSelectedIndex]);

  useEffect(() => {
    if (objActiveItemRef.current) {
      objActiveItemRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [intSelectedIndex]);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-[95] animate-in fade-in duration-300"
        aria-hidden="true"
      />

      <div 
        ref={objFullPanelRef}
        tabIndex={-1} 
        className="fixed top-0 left-0 h-full z-[100] w-full landscape:max-sm:w-[85%] sm:w-[85%] md:w-[35%] bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-border focus:outline-none"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-background">
          <h2 className="font-semibold text-sm text-foreground">Historial de Búsqueda</h2>
          <button 
            onClick={() => setBolShowFullHistoryPanel(false)} 
            className="text-muted-foreground hover:text-foreground hover:bg-secondary-fund p-2 rounded-full font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto py-2 scrollbar-custom">
          {arrHistory.map((objItem, intIndex) => (
            <CityListItem
              key={`full-hist-${objItem.strId}`}
              objItem={objItem}
              bolIsSelected={intSelectedIndex === intIndex}
              objItemRef={intSelectedIndex === intIndex ? objActiveItemRef : null}
              strSuggestionHover={strSuggestionHover}
              fnOnMouseEnter={() => setIntSelectedIndex(intIndex)}
              fnOnSelect={() => {
                handleFillFromHistory(objItem.strName);
                setBolShowFullHistoryPanel(false);
              }}
              fnOnDelete={() => {
                handleDeleteHistoryItem(objItem.strId);
              }}
            />
          ))}
        </ul>
      </div>
    </>
  );
}