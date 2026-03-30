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
  { value: "anticretico", label: "Anticretico" },
] as const;

export type OperationType = (typeof operationTypeOptions)[number]["value"];

type OperationTypeFilterProps = {
  value: OperationType;
  onChange: (value: OperationType) => void;
  defaultOpen?: boolean;
};

export function OperationTypeFilter({
  value,
  onChange,
  defaultOpen = true,
}: OperationTypeFilterProps) {
  const [openItem, setOpenItem] = useState(
    defaultOpen ? "operation-type" : "",
  );

  const selectedLabel =
    operationTypeOptions.find((option) => option.value === value)?.label ??
    "Selecciona una opcion";

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={setOpenItem}
      className="w-full"
    >
      <AccordionItem value="operation-type" className="space-y-2">
        <AccordionTrigger>{selectedLabel}</AccordionTrigger>

        <AccordionContent>
          <div className="rounded-2xl border border-[#cfc4b6] bg-white p-3 shadow-sm">
            <div className="space-y-1">
              {operationTypeOptions.map((option) => {
                const checked = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpenItem("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-[#2E2E2E] transition hover:bg-[#F4EFE6]",
                      checked && "bg-[#F8F3EC]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full border transition",
                        checked
                          ? "border-[#1F3A4D]"
                          : "border-[#7b746b] bg-white",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full bg-[#1F3A4D] transition",
                          checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
                        )}
                      />
                    </span>

                    <span>{option.label}</span>
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
