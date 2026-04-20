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
    defaultOpen ? "operation-type" : "",
  );

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLLabelElement | null>>([]);

  const toggle = (operation: OperationType) => {
    onChange(
      value.includes(operation)
        ? value.filter((item) => item !== operation)
        : [...value, operation],
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
    selectedLabel.length > 30
      ? `${selectedLabel.slice(0, 20)}..`
      : selectedLabel;

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
    optionValue: OperationType,
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
          <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              ref={triggerButtonRef}
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]",
              )}
            >
              <div className="flex w-full items-center justify-between pr-2">
                <span className="truncate">{labelTruncated}</span>
                {value.length > 0 && (
                  <X
                    size={16}
                    className="ml-2 text-[#4B4B4B] transition-colors hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange([]);
                    }}
                  />
                )}
              </div>
            </AccordionTrigger>
          </div>

          <AccordionContent className="pb-0 pt-3">
            <div className="w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
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
                        "flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] transition outline-none",
                        "focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2",
                        isChecked
                          ? "bg-[#E7E3DD]"
                          : "bg-transparent hover:bg-[#F4EFE6]",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={isChecked}
                        onCheckedChange={() => toggle(option.value)}
                        className={cn(
                          "h-[18px] w-[18px] rounded-full border border-[#8A847C] data-[state=checked]:border-[#1F3A4D] data-[state=checked]:bg-[#1F3A4D]",
                          "[&_svg]:text-white",
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