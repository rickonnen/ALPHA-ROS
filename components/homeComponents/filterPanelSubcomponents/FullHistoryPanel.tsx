import { useEffect, useRef } from "react";
import { useCitySearch } from "../../hooks/useCitySearch";
import CityListItem from "./CityListItem";

interface FullHistoryPanelProps {
  hookData: ReturnType<typeof useCitySearch>;
  strSuggestionHover: string;
}

export default function FullHistoryPanel({ hookData, strSuggestionHover }: FullHistoryPanelProps) {
  const objFullPanelRef = useRef<HTMLDivElement>(null);
  const objActiveItemRef = useRef<HTMLLIElement>(null);

  const {
    arrHistory, intSelectedIndex, setIntSelectedIndex,
    setBolShowFullHistoryPanel, handleFillFromHistory, handleDeleteHistoryItem
  } = hookData;

  const intSelectedIndexRef = useRef(intSelectedIndex);
  useEffect(() => {
    intSelectedIndexRef.current = intSelectedIndex;
  }, [intSelectedIndex]);

  useEffect(() => {
    const strOriginalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    // Reiniciar el índice al abrir el panel
    setIntSelectedIndex(0);

    const handleFocusTrap = (objEvent: KeyboardEvent) => {
      if (!objFullPanelRef.current) return;
      objEvent.stopPropagation();

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

  // Auto-scroll dentro del panel completo
  useEffect(() => {
    if (objActiveItemRef.current) {
      objActiveItemRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [intSelectedIndex]);

  return (
    <>
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