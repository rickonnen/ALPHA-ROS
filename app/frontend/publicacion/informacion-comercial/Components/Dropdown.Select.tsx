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
import styles from "../InformacionComercial.module.css";
import dropdownStyles from "./Dropdown.Select.module.css";

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
  const triggerClassName = `${dropdownStyles.trigger} ${
    hasError ? dropdownStyles.triggerError : dropdownStyles.triggerDefault
  } ${!value ? dropdownStyles.triggerPlaceholder : dropdownStyles.triggerValue}`;

  return (
    <div className={styles.icField}>
      <label htmlFor={id} className={styles.icLabel}>
        {label}
      </label>

      <Select
        value={value}
        onValueChange={(val) => {
          onSelect(val);
        }}
        onOpenChange={(open) => {
          if (!open && !value) {
            onClose?.();
          }
        }}
      >
        <SelectTrigger
          id={id}
          className={triggerClassName}
        >
          <SelectValue placeholder="Seleccione una opción" />
        </SelectTrigger>

        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={2}
          avoidCollisions={true}
          className={dropdownStyles.content}
        >
          <SelectGroup>
            <SelectLabel className={dropdownStyles.contentLabel}>
              Opciones
            </SelectLabel>
            {options.map((opt) => (
              <SelectItem
                key={opt}
                value={opt}
                className={dropdownStyles.item}
              >
                {opt}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {hasError && errorMsg && <span className={styles.icErr}>{errorMsg}</span>}
    </div>
  );
}
