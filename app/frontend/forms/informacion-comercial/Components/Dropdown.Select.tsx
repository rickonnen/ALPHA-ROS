"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "../InformacionComercial.module.css";

interface DropdownSelectProps {
  id:        string;
  label:     string;
  options:   readonly string[];
  value:     string;
  hasError:  boolean;
  errorMsg?: string;
  onSelect:  (opt: string) => void;
  onClose?:  () => void;
}

export default function DropdownSelect({
  id, label, options, value,
  hasError, errorMsg, onSelect, onClose,
}: DropdownSelectProps) {
  return (
    <div className={styles.icField}>
      <label htmlFor={id} className={styles.icLabel}>{label}</label>
      <Select
        value={value}
        onValueChange={(val) => {
          onSelect(val);
          onClose?.();
        }}
      >
        <SelectTrigger
          id={id}
          className={`w-full h-10 px-3 text-[0.88rem] bg-white rounded-md border transition-colors outline-none
            ${hasError ? "border-[#C0503A]" : "border-[#D4CFC6] focus:border-[#8A8480]"}
            ${!value ? "text-[#B8B2AC]" : "text-[#1A1714]"}`}
        >
          <SelectValue placeholder="Seleccione una opción" />
        </SelectTrigger>

        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={2}
          avoidCollisions={true}
          className="w-[var(--radix-select-trigger-width)] bg-white border border-[#D4CFC6] rounded-md shadow-md p-0 z-[100]"
        >
          {options.map((opt) => (
           <SelectItem
  key={opt}
  value={opt}
  className="pl-8 pr-4 py-2.5 text-[0.88rem] text-[#1A1714] cursor-pointer 
    focus:bg-[#F5F1EC] focus:text-[#1A1714]
    data-[state=checked]:font-medium
    [&>span:first-child]:left-2 
    [&>span:first-child]:right-auto"
>
  {opt}
</SelectItem>

          ))}
        </SelectContent>
      </Select>

      {hasError && errorMsg && (
        <span className={styles.icErr}>{errorMsg}</span>
      )}
    </div>
  );
}