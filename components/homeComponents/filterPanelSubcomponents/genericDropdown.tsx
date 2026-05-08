"use client";

import { useState } from "react";
import { useHoverAnimation } from "../../hooks/useHoverAnimation";

interface GenericDropdownProps {
  strDisplayText: string;
  arrOptions: string[];
  arrSelectedValues: string[];
  bolIsOpen: boolean;
  fnToggleOpen: () => void;
  fnOnSelect: (strVal: string) => void;
  bolIsMultiple?: boolean;
}

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 16/04/2026
 * funcionalidad: componente genérico de menú desplegable reutilizable
 * @param strDisplayText texto a mostrar en el botón principal
 * @param arrOptions arreglo de opciones disponibles en el menú
 * @param arrSelectedValues arreglo de valores actualmente seleccionados
 * @param bolIsOpen booleano que indica si la lista de opciones está visible
 * @param fnToggleOpen función para abrir o cerrar el menú
 * @param fnOnSelect función de callback al elegir una opción
 * @param bolIsMultiple opcional para habilitar selección múltiple (muestra indicador)
 * @return elemento jsx con la estructura del menú desplegable interactivo
 */
export default function GenericDropdown({
  strDisplayText,
  arrOptions,
  arrSelectedValues,
  bolIsOpen,
  fnToggleOpen,
  fnOnSelect,
  bolIsMultiple = false,
}: GenericDropdownProps) {
  // estado interno para rastrear el índice enfocado al usar las flechas del teclado
  const [intDropdownIndex, setIntDropdownIndex] = useState<number>(-1);

  const triggerHover = useHoverAnimation(true, false, 'pointer');
  const optionHover = useHoverAnimation(true, true, 'pointer', true, false);

  // maneja los eventos de teclado
  const handleDropdownKeyDown = (objEvent: React.KeyboardEvent) => {
    if (!bolIsOpen) return;

    if (objEvent.key === "ArrowDown") {
      objEvent.preventDefault();
      setIntDropdownIndex((prev) => (prev < arrOptions.length - 1 ? prev + 1 : 0));
    } else if (objEvent.key === "ArrowUp") {
      objEvent.preventDefault();
      setIntDropdownIndex((prev) => (prev > 0 ? prev - 1 : arrOptions.length - 1));
    } else if (objEvent.key === "Enter" && intDropdownIndex !== -1) {
      objEvent.preventDefault();
      fnOnSelect(arrOptions[intDropdownIndex]);
    } else if (objEvent.key === "Escape") {
      fnToggleOpen();
    }
  };

  const strDropdownBaseClass = "w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full text-sm font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund transition-colors";
  const strDropdownActiveStyle = "bg-background text-foreground border-card-border";
  const strDropdownInactiveStyle = "bg-primary text-primary-foreground border-primary";

  return (
    <div className="relative flex-1 md:flex-none">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={bolIsOpen}
        onClick={() => {
          fnToggleOpen();
          setIntDropdownIndex(-1);
        }}
        onKeyDown={handleDropdownKeyDown}
        className={`${strDropdownBaseClass} ${bolIsOpen ? strDropdownActiveStyle : strDropdownInactiveStyle} ${triggerHover}`}
      >
        {strDisplayText}
        <svg className={`w-3.5 h-3.5 transition-transform ${bolIsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {bolIsOpen && (
        <div role="listbox" className="absolute top-[calc(100%+8px)] left-0 z-50 w-full md:w-52 bg-card-bg rounded-xl border border-card-border shadow-lg overflow-hidden p-1">
          {arrOptions.map((strOption, index) => {
            const bolIsSelected = arrSelectedValues.includes(strOption);
            const bolIsHovered = intDropdownIndex === index;

            return (
              <button
                key={strOption}
                type="button"
                role="option"
                aria-selected={bolIsSelected}
                // activa los estilos de hover del hook personalizado
                data-active={bolIsHovered} 
                onClick={() => fnOnSelect(strOption)}
                onMouseEnter={() => setIntDropdownIndex(index)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card-bg transition-colors ${
                  bolIsSelected || bolIsHovered ? "bg-secondary-fund text-foreground font-bold" : "text-foreground hover:bg-secondary-fund/60"
                } ${optionHover}`}
              >
                <span>{strOption}</span>
                {bolIsMultiple && (
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${bolIsSelected ? "bg-primary border-primary" : "border-foreground/40 bg-card-bg"}`}>
                    {bolIsSelected && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" /> }
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}