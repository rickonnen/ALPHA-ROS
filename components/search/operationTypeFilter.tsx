"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const operationTypeOptions = [
  { value: "venta", label: "En venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "anticretico", label: "Anticrético" },
] as const;

export type OperationType = (typeof operationTypeOptions)[number]["value"];
export type OperationTypeValue = OperationType | null;

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
  const [openItem, setOpenItem] = useState(
    defaultOpen ? "operation-type" : "",
  );

  const selectedLabel =
    operationTypeOptions.find((option) => option.value === value)?.label ??
    "Tipo de Operación";

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={setOpenItem}
      className="w-full mt-3"
    >
      <AccordionItem value="operation-type" className="border-none">
        <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
          <AccordionTrigger
            className={cn(
              "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
              "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
            )}
          >
            {selectedLabel}
          </AccordionTrigger>
        </div>

        <AccordionContent className="pt-3 pb-0">
          <div className="w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
            <div className="space-y-2">
              {operationTypeOptions.map((option) => {
                const checked = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(checked ? null : option.value);
                      setOpenItem("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm text-[#2E2E2E] transition",
                      checked
                        ? "bg-[#E7E3DD]"
                        : "bg-transparent hover:bg-[#F4EFE6]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition",
                        checked
                          ? "border-[#6B6B6B] bg-white"
                          : "border-[#8A847C] bg-white"
                      )}
                    >
                      <span
                        className={cn(
                          "h-[8px] w-[8px] rounded-full bg-[#1F3A4D] transition",
                          checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        )}
                      />
                    </span>

                    <span className="text-sm text-[#2E2E2E]">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
