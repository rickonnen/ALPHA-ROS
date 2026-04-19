"use client";

import type { CitySuggestion } from "../../hooks/mapboxService";

interface CityListItemProps {
  objItem: CitySuggestion;
  bolIsSelected: boolean;
  objItemRef?: React.RefObject<HTMLLIElement> | null;
  strSuggestionHover: string;
  fnOnMouseEnter: () => void;
  fnOnSelect: () => void;
  fnOnDelete?: (objEvent: React.MouseEvent) => void;
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
  const strSecondary = arrParts.slice(1).join(",").replace(/Bolivia/gi, "").replace(/,\s*$/, "").trim();

  return (
    <li
      ref={objItemRef}
      data-active={bolIsSelected}
      onMouseEnter={fnOnMouseEnter}
      onMouseDown={(objEvent) => {
        objEvent.preventDefault();
        fnOnSelect();
      }}
      className={`flex items-center justify-between px-3 py-2 mx-1 my-0.5 rounded-lg focus-visible:outline-none cursor-pointer transition-all ${
        bolIsSelected
          ? "bg-secondary-fund border-border shadow-[0_4px_15px_rgba(0,0,0,0.1)] scale-[1.01]"
          : "hover:bg-secondary-fund/60 border-transparent"
      } ${strSuggestionHover}`}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1">
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
      </div>

      {fnOnDelete && (
        <button
          onClick={(objEvent) => {
            objEvent.stopPropagation();
            fnOnDelete(objEvent);
          }}
          className="p-2 hover:bg-destructive/10 rounded-full flex-shrink-0 group transition-colors ml-2"
          title="Eliminar del historial"
        >
          <img
            src="/binDelete.svg"
            alt="Eliminar"
            className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity filter group-hover:hue-rotate-180"
          />
        </button>
      )}
    </li>
  );
}