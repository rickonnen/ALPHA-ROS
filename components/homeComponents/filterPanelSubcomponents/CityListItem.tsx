"use client";

/**
 * Autor: Jose Daniel Condarco Flores
 * Componente: CityListItem
 * fecha: 19/4/2026
 * Función: Muestra una ciudad, permite seleccionarla y eliminarla del historial.
 */
import type { MouseEvent, RefObject } from "react";
import type { CitySuggestion } from "../../hooks/mapboxService";

interface CityListItemProps {
  objItem: CitySuggestion;
  bolIsSelected: boolean;
  objItemRef?: RefObject<HTMLElement | null> | null;
  strSuggestionHover: string;
  fnOnMouseEnter: () => void;
  fnOnSelect: () => void;
  fnOnDelete?: (objEvent: MouseEvent<HTMLButtonElement>) => void;
}

export default function CityListItem({
  objItem,
  bolIsSelected,
  objItemRef,
  strSuggestionHover,
  fnOnMouseEnter,
  fnOnSelect,
  fnOnDelete,
}: CityListItemProps) {
  const arrParts = objItem.strFullName.split(",");
  const strSecondary = arrParts
    .slice(1)
    .join(",")
    .replace(/Bolivia/gi, "")
    .replace(/,\s*$/, "")
    .trim();

  return (
    <li
      ref={objItemRef as RefObject<HTMLLIElement>}
      data-active={bolIsSelected}
      onMouseEnter={fnOnMouseEnter}
      onMouseDown={(objEvent) => {
        const objTarget = objEvent.target as HTMLElement;

        if (objTarget.closest("button")) {
          return;
        }

        objEvent.preventDefault();
        fnOnSelect();
      }}
      className={`flex items-center justify-between px-3 py-2 mx-1 my-0.5 rounded-lg focus-visible:outline-none cursor-pointer transition-all ${
        bolIsSelected
          ? "bg-secondary-fund border-card-border shadow-[0_0.25rem_0.9375rem_rgba(0,0,0,0.1)] scale-[1.01]"
          : "hover:bg-secondary-fund/60 border-transparent"
      } ${strSuggestionHover}`}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <img
          src={objItem.strIcon}
          alt="BO"
          className="h-4 w-5 flex-shrink-0"
        />

        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-foreground truncate">
            {objItem.strName}
          </span>

          {(objItem.strTypePlace || strSecondary) && (
            <span className="text-xs text-foreground/60 truncate flex items-center gap-1.5 mt-0.5">
              {objItem.strTypePlace && (
                <span className="font-semibold text-foreground/60 bg-secondary-fund px-1.5 py-0.5 rounded-md text-[0.625rem] uppercase tracking-wider">
                  {objItem.strTypePlace}
                </span>
              )}

              {strSecondary && (
                <span className="truncate">
                  {strSecondary.replace(/^,\s*/, "")}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {fnOnDelete && (
        <button
          type="button"
          onMouseDown={(objEvent) => {
            objEvent.preventDefault();
            objEvent.stopPropagation();
          }}
          onClick={(objEvent) => {
            objEvent.preventDefault();
            objEvent.stopPropagation();
            fnOnDelete(objEvent);
          }}
          className="p-2 hover:bg-secondary/20 rounded-full flex-shrink-0 group transition-colors ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Eliminar del historial"
          aria-label="Eliminar del historial"
        >
          <img
            src="/binDelete.svg"
            alt="Eliminar"
            className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity filter svg-theme-invert"
          />
        </button>
      )}
    </li>
  );
}