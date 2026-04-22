"use client";

/**
 * @Dev: [OliverG]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Componente dropdown reutilizable para los campos Tipo de Propiedad
 * y Tipo de Operación del formulario de Información Comercial.
 * Usa button + ul custom para evitar el bloqueo de scroll de Radix UI.
 * @param {string} id - Identificador único del elemento select
 * @param {string} label - Texto de la etiqueta que aparece encima del select
 * @param {readonly string[]} options - Lista de opciones seleccionables
 * @param {string} value - Valor actualmente seleccionado
 * @param {boolean} hasError - Indica si el campo tiene un error de validación
 * @param {string} errorMsg - Mensaje de error a mostrar cuando hasError es true
 * @param {function} onSelect - Callback cuando se selecciona una opción
 * @param {function} onClose - Callback cuando el dropdown se cierra sin selección
 * @return {JSX.Element} Campo select con etiqueta y manejo de errores inline
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
  id,
  label,
  options,
  value,
  hasError,
  errorMsg,
  onSelect,
  onClose,
}: DropdownSelectProps) {
  const [bolOpen, setBolOpen] = useState(false);
  const [bolWasOpened, setBolWasOpened] = useState(false);
  const refContainer = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (refContainer.current && !refContainer.current.contains(e.target as Node)) {
        setBolOpen(false);
        // Disparar onClose solo si el usuario abrió el dropdown sin seleccionar
        if (bolWasOpened && !value) {
          onClose?.();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bolWasOpened, value, onClose]);

  /**
   * @Funcionalidad: Maneja la selección de una opción del dropdown
   * @param {string} strOpt - Opción seleccionada por el usuario
   */
  const handleSelect = (strOpt: string) => {
    onSelect(strOpt);
    setBolOpen(false);
  };

  /**
   * @Funcionalidad: Cierra el dropdown al presionar Tab o Escape
   * @param {React.KeyboardEvent} e - Evento de teclado
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "Escape") {
      setBolOpen(false);
      if (!value) onClose?.();
    }
  };

  return (
    // w-full asegura que ocupe todo el ancho del card en mobile
    <div className="flex flex-col gap-[5px] mb-[14px] w-full items-stretch" ref={refContainer}>
      <Label
        htmlFor={id}
        className="text-[0.875rem] font-medium text-[#1A1714] tracking-[-0.01em] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]"
      >
        {label}
      </Label>

      {/* Trigger del dropdown */}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={bolOpen}
        aria-controls={`${id}-listbox`}
        onKeyDown={handleKeyDown}
        onClick={() => {
          setBolOpen((prev) => !prev);
          setBolWasOpened(true);
        }}
        className={`
          w-full h-[40px] px-[12px] text-[0.88rem] bg-white rounded-[6px]
          border transition-[border-color] duration-150 outline-none
          flex items-center justify-between
          font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]
          ${hasError ? "border-[#C0503A]" : "border-[#D4CFC6]"}
          ${value ? "text-[#1A1714]" : "text-[#B8B2AC]"}
        `}
      >
        <span>{value || "Seleccione una opción"}</span>
        {/* Ícono chevron que rota al abrir */}
        <svg
          className={`w-4 h-4 text-[#B8B2AC] transition-transform duration-200 flex-shrink-0 ${bolOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Lista de opciones — position absolute para no bloquear el scroll */}
      {bolOpen && (
        <div className="relative z-[100]">
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute top-1 left-0 w-full bg-white border border-[#D4CFC6] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1 max-h-60 overflow-auto font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]"
          >
            {/* Encabezado de opciones */}
            <li className="py-[8px] pr-[16px] pl-[32px] text-[0.88rem] font-bold text-[#1A1714]">
              Opciones
            </li>
            {options.map((strOpt) => (
              <li
                key={strOpt}
                role="option"
                aria-selected={strOpt === value}
                onClick={() => handleSelect(strOpt)}
                className="flex items-center gap-2 py-[12px] pr-[16px] pl-[32px] text-[0.88rem] text-[#1A1714] hover:bg-[#f5f5f5] cursor-pointer"
              >
                {/* Checkmark para la opción seleccionada */}
                <span className="w-4 flex-shrink-0 absolute left-2">
                  {strOpt === value && (
                    <svg className="w-4 h-4 text-[#1A1714]" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <span className={strOpt === value ? "font-medium" : ""}>{strOpt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje de error inline debajo del campo */}
      {hasError && errorMsg && (
        <span className="text-[0.74rem] text-[#C0503A] mt-1 leading-[1.4] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]">
          {errorMsg}
        </span>
      )}
    </div>
  );
}