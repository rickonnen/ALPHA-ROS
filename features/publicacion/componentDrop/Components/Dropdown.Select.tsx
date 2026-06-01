"use client";
/**
 * Dev: Dylan Coca Beltran - xdev/sow-dylanc
 * Fecha: 26/04/2026
 * Fix: Reemplazo de colores hardcodeados por variables CSS del sistema para soporte de modo oscuro:
 *      text-[#1A1714] → text-foreground, bg-white → bg-card-bg,
 *      border-[#D4CFC6] → border-card-border, text-[#B8B2AC] → text-muted-foreground,
 *      hover:bg-[#f5f5f5] → hover:bg-muted
 */

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface DropdownSelectProps {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  hasError: boolean;
  errorMsg?: string;
  onSelect: (strOption: string) => void;
  onClose?: () => void;
}

export default function DropdownSelect({
  id, label, options, value, hasError, errorMsg, onSelect, onClose,
}: DropdownSelectProps) {
  const [bolOpen, setBolOpen] = useState(false);
  const [bolWasOpened, setBolWasOpened] = useState(false);
  const refContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (refContainer.current && !refContainer.current.contains(e.target as Node)) {
        setBolOpen(false);
        if (bolWasOpened && !value) onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bolWasOpened, value, onClose]);

  const handleSelect = (strOpt: string) => {
    onSelect(strOpt);
    setBolOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "Escape") {
      setBolOpen(false);
      if (!value) onClose?.();
    }
  };

  return (
    // ✅ Sin mb-[14px] — el espaciado lo controla el padre con gap
    <div className="flex flex-col gap-[5px] w-full" ref={refContainer}>
      {label && (
        <Label htmlFor={id} className="text-[0.875rem] font-medium text-foreground">
          {label}
        </Label>
      )}

      {/* ✅ position relative aquí, no en un div hermano */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={bolOpen}
          aria-controls={`${id}-listbox`}
          onKeyDown={handleKeyDown}
          onClick={() => { setBolOpen(prev => !prev); setBolWasOpened(true); }}
          className={`
            w-full h-[40px] px-[12px] text-[0.88rem] bg-card-bg rounded-[6px]
            border transition-[border-color] duration-150 outline-none
            flex items-center justify-between
            ${hasError ? "border-destructive" : "border-card-border"}
            ${value ? "text-foreground" : "text-muted-foreground"}
          `}
        >
          <span>{value || "Seleccione una opción"}</span>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${bolOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* ✅ ul flota con absolute — no empuja nada */}
        {bolOpen && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100 }}
            className="bg-card-bg border border-card-border rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1 max-h-60 overflow-auto"
          >
            <li className="py-[8px] pr-[16px] pl-[32px] text-[0.88rem] font-bold text-foreground">
              Opciones
            </li>
            {options.map((strOpt) => (
              <li
                key={strOpt}
                role="option"
                aria-selected={strOpt === value}
                onClick={() => handleSelect(strOpt)}
                className="flex items-center gap-2 py-[6px] pr-[16px] pl-[32px] text-[0.88rem] text-foreground hover:bg-muted cursor-pointer"
              >
                <span className="w-4 flex-shrink-0 absolute left-2">
                  {strOpt === value && (
                    <svg className="w-4 h-4 text-foreground" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className={strOpt === value ? "font-medium" : ""}>{strOpt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Error con h-4 fijo — ocupa espacio aunque no haya error */}
      <span className="text-xs text-destructive h-4 block leading-[1.4]">
        {hasError && errorMsg ? errorMsg : ''}
      </span>
    </div>
  );
}