"use client";

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
  onSelect: (opt: string) => void;
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
    /* w-full asegura que ocupe todo el ancho del card blanco en mobile */
    <div className="flex flex-col gap-[5px] mb-[14px] w-full items-stretch">
      <Label 
        htmlFor={id} 
        className="text-[0.82rem] font-medium text-[#1A1714] tracking-[-0.01em] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]"
      >
        {label}
      </Label>

      <Select
        value={value}
        onValueChange={onSelect}
        onOpenChange={(open) => {
          if (!open && !value) {
            onClose?.();
          }
        }}
      >
        <SelectTrigger
          id={id}
          /* h-[40px] se mantiene igual, w-full es vital para mobile */
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
          /* El ancho del dropdown coincidirá con el del trigger en mobile */
          className="w-[var(--radix-select-trigger-width)] min-w-[200px] bg-white border-[#D4CFC6] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif] z-[100]"
        >
          <SelectGroup>
            <SelectLabel className="py-[8px] pr-[16px] pl-[32px] text-[0.88rem] font-bold text-[#1A1714]">
              Opciones
            </SelectLabel>
            {options.map((opt) => (
              <SelectItem
                key={opt}
                value={opt}
                className="py-[12px] pr-[16px] pl-[32px] text-[0.88rem] text-[#1A1714] cursor-pointer focus:bg-[#F5F1EC] focus:text-[#1A1714] data-[state=checked]:font-medium [&>span:first-child]:left-2"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasError && errorMsg && (
        <span className="text-[0.74rem] text-[#C0503A] mt-1 leading-[1.4] font-['Geist',_ui-sans-serif,_system-ui,_sans-serif]">
          {errorMsg}
        </span>
      )}
    </div>
  );
}