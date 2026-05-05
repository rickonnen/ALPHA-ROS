"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const operationTypeOptions = [
  { value: "venta", label: "En venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "anticretico", label: "Anticrético" },
] as const;

export type OperationType = (typeof operationTypeOptions)[number]["value"];
export type OperationTypeValue = OperationType[];

type OperationTypeFilterProps = {
  value: OperationTypeValue;
  onChange: (value: OperationTypeValue) => void;
  defaultOpen?: boolean;
};

export function OperationTypeFilter({
  value,
  onChange,
  defaultOpen = false,
}: OperationTypeFilterProps) {
  const [accordionValue, setAccordionValue] = useState<string>(
    defaultOpen ? "operation-type" : ""
  );

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLLabelElement | null>>([]);

  const toggle = (operation: OperationType) => {
    onChange(
      value.includes(operation)
        ? value.filter((item) => item !== operation)
        : [...value, operation]
    );
  };

  const selectedLabel =
    value.length === 0
      ? "Tipo de Operación"
      : operationTypeOptions
          .filter((option) => value.includes(option.value))
          .map((option) => option.label)
          .join(", ");

  const labelTruncated =
    selectedLabel.length > 30 ? `${selectedLabel.slice(0, 20)}..` : selectedLabel;

  const isOpen = accordionValue === "operation-type";

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        optionRefs.current[0]?.focus();
      });
    }
  }, [isOpen]);

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLLabelElement>,
    index: number,
    optionValue: OperationType
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % operationTypeOptions.length;
      optionRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        (index - 1 + operationTypeOptions.length) % operationTypeOptions.length;
      optionRefs.current[prevIndex]?.focus();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      toggle(optionValue);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setAccordionValue("");
      requestAnimationFrame(() => {
        triggerButtonRef.current?.focus();
      });
    }
  };

  const clearFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onChange([]);
  };

  return (
    <div className="mt-3 w-full">
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="w-full"
      >
        <AccordionItem value="operation-type" className="border-none">
          <div className="relative overflow-hidden rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              ref={triggerButtonRef}
              className={cn(
                "relative w-full px-4 py-3 pr-20 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:-translate-y-1/2 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              <span className="block max-w-full truncate pr-2">
                {labelTruncated}
              </span>
            </AccordionTrigger>

            {value.length > 0 && (
              <button
                type="button"
                aria-label="Limpiar filtro de tipo de operación"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange([]);
                }}
                className="absolute right-8 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-colors hover:bg-[#DEDAD3]"
              >
                <X className="h-4 w-4 text-[#5E5A55]" />
              </button>
            )}
          </div>

          <AccordionContent className="pb-0 pt-3">
            <div className="w-full rounded-lg border border-[#C8C0B5] bg-white p-3 shadow-sm">
              <div className="space-y-2">
                {operationTypeOptions.map((option, index) => {
                  const id = `operation-type-${option.value}`;
                  const isChecked = value.includes(option.value);

                  return (
                    <Label
                      key={option.value}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      tabIndex={0}
                      htmlFor={id}
                      onKeyDown={(event) =>
                        handleOptionKeyDown(event, index, option.value)
                      }
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] outline-none transition",
                        "focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2",
                        isChecked
                          ? "bg-[#E7E3DD]"
                          : "bg-transparent hover:bg-[#F4EFE6]"
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={isChecked}
                        onCheckedChange={() => toggle(option.value)}
                        className={cn(
                          "h-[18px] w-[18px] rounded-lg border border-[#8A847C] data-[state=checked]:border-[#1F3A4D] data-[state=checked]:bg-[#1F3A4D]",
                          "[&_svg]:text-white"
                        )}
                      />

                      <span className="select-none text-sm text-[#2E2E2E]">
                        {option.label}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}