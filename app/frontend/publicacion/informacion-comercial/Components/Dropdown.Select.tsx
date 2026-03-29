"use client";

/**
 * @Dev: [OliverG]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Componente dropdown reutilizable para los campos Tipo de Propiedad
 * y Tipo de Operación del formulario de Información Comercial.
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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  return (
    // w-full asegura que ocupe todo el ancho del card en mobile
    <div className="flex flex-col gap-[5px] mb-[14px] w-full items-stretch">
      <Label
        htmlFor={id}
        className="text-[0.875rem] font-medium text-[#1A1714] tracking-[-0.01em] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]"
      >
        {label}
      </Label>

      <Select
        value={value}
        onValueChange={onSelect}
        onOpenChange={(bolOpen) => {
          // Mostrar error solo al cerrar sin haber seleccionado un valor
          if (!bolOpen && !value) {
            onClose?.();
          }
        }}
      >
        <SelectTrigger
          id={id}
          // h-[40px] coincide con el diseño, w-full es clave para mobile
          className={cn(
            "w-full h-[40px] px-[12px] text-[0.88rem] bg-white transition-[border-color] duration-150 rounded-[6px] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif] focus:ring-0 focus:ring-offset-0 outline-none",
            hasError ? "border-[#C0503A]" : "border-[#D4CFC6]",
            value ? "text-[#1A1714]" : "text-[#B8B2AC]"
          )}
        >
          <SelectValue placeholder="Seleccione una opción" />
        </SelectTrigger>

        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={4}
          // El ancho del dropdown coincide con el del trigger en mobile
          className="w-[var(--radix-select-trigger-width)] min-w-[200px] bg-white border-[#D4CFC6] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif] z-[100]"
        >
          <SelectGroup>
            <SelectLabel className="py-[8px] pr-[16px] pl-[32px] text-[0.88rem] font-bold text-[#1A1714]">
              Opciones
            </SelectLabel>
            {options.map((strOpt) => (
              <SelectItem
                key={strOpt}
                value={strOpt}
                className="py-[12px] pr-[16px] pl-[32px] text-[0.88rem] text-[#1A1714] cursor-pointer hover:bg-[#E5E5E5] focus:bg-[#E5E5E5] focus:text-[#1A1714] data-[highlighted]:bg-[#E5E5E5] data-[state=checked]:font-medium [&>span:first-child]:left-2"
              >
                {strOpt}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Mensaje de error inline debajo del campo */}
      {hasError && errorMsg && (
        <span className="text-[0.74rem] text-[#C0503A] mt-1 leading-[1.4] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
