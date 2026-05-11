"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useCitySearch } from "../hooks/useCitySearch";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchAutocomplete({
  value,
  onChange,
}: SearchAutocompleteProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  const {
    strCity,
    arrSuggestions,
    bolShowSuggestions,
    bolNoResults,
    intSelectedIndex,
    handleCityChange,
    handleSelectSuggestion,
    handleKeyDown,
  } = useCitySearch();

  useEffect(() => {
    onChange(strCity);
  }, [strCity, onChange]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [intSelectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full mt-3">
      <div className="relative w-full flex items-center">
        <input
          type="text"
          placeholder="Buscar por ubicación"
          value={strCity}
          onChange={(e) => handleCityChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#5E5A55] shadow-sm"
        />
        
        {strCity && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCityChange("");
            }}
            className="absolute right-3 p-1 rounded-full hover:bg-[#D4CCBF] transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4 text-[#5E5A55]" />
          </button>
        )}
      </div>

      {bolShowSuggestions && (
        <ul className="absolute top-full z-50 mt-2 w-full rounded-[16px] border border-[#C8C0B5] bg-white p-2 shadow-sm max-h-[200px] overflow-y-auto">
          {arrSuggestions.map((item, index) => {
            const parts = item.strFullName.split(",");
            const secondaryText =
              parts.length > 1
                ? parts[1].replace(/Bolivia/gi, "").trim()
                : "";

            const isSelected = index === intSelectedIndex;

            return (
              <li
                key={item.strId}
                ref={isSelected ? activeItemRef : null}
                onMouseDown={() => handleSelectSuggestion(item)}
                className={`flex items-center gap-3 cursor-pointer rounded-[12px] px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-[#E7E1D7]"
                    : "text-[#2E2E2E] hover:bg-[#F4EFE6]"
                }`}
              >
                <img
                  src={item.strIcon}
                  alt="icon"
                  className="w-4 h-4 flex-shrink-0"
                />

                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-sm font-medium truncate">
                    {item.strName}
                  </span>

                  {(item.strTypePlace || secondaryText) && (
                    <span className="text-xs text-[#A89F92] flex items-center gap-1.5 mt-0.5 min-w-0">
                      {item.strTypePlace && (
                        <span className="font-semibold text-[#8b8276] bg-[#E7E1D7] px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider flex-shrink-0">
                          {item.strTypePlace}
                        </span>
                      )}

                      {secondaryText && (
                        <span className="truncate">{secondaryText}</span>
                      )}
                    </span>
                  )}
                </div>
              </li>
            );
          })}

          {bolNoResults && (
            <li className="px-3 py-2 text-sm text-gray-500">
              No se encontraron resultados
            </li>
          )}
        </ul>
      )}
    </div>
  );
}