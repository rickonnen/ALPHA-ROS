"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Geist } from "next/font/google";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type TipoInmueble = {
  id_tipo_inmueble: number;
  nombre_inmueble: string | null;
};

type Props = {
  tipos: TipoInmueble[];
  selected: number[];
  onChange: (selected: number[]) => void;
};

const geist = Geist({
  subsets: ["latin"],
});

export function FilterTypeProperty({ tipos, selected, onChange }: Props) {
  const [accordionValue, setAccordionValue] = useState<string>("");

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLLabelElement | null>>([]);

  const toggle = (id: number) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  const label =
    selected.length === 0
      ? "Tipo Inmueble"
      : tipos
          .filter((t) => selected.includes(t.id_tipo_inmueble))
          .map((t) => t.nombre_inmueble)
          .filter(Boolean)
          .join(", ");

  const labelTruncated = label.length > 30 ? `${label.slice(0, 20)}..` : label;

  const isOpen = accordionValue === "tipo-inmueble";

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
    optionId: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % tipos.length;
      optionRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = (index - 1 + tipos.length) % tipos.length;
      optionRefs.current[prevIndex]?.focus();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      toggle(optionId);
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
        className="w-full"
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="tipo-inmueble" className="border-none">
          <div className="relative overflow-hidden rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              ref={triggerButtonRef}
              className={cn(
                `${geist.className} relative w-full px-4 py-3 pr-20 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline`,
                "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:-translate-y-1/2 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              <span className="block max-w-full truncate pr-2 text-left">
                {labelTruncated}
              </span>
            </AccordionTrigger>

            {selected.length > 0 && (
              <button
                type="button"
                aria-label="Limpiar filtro de tipo de inmueble"
                onClick={clearFilter}
                className="absolute right-8 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-colors hover:bg-[#DEDAD3]"
              >
                <X className="h-4 w-4 text-[#5E5A55]" />
              </button>
            )}
          </div>

          <AccordionContent className={`${geist.className} pb-0 pt-3`}>
            <div className="w-full rounded-lg border border-[#C8C0B5] bg-white p-3 shadow-sm">
              <div className="space-y-2">
                {tipos.map((tipo, index) => {
                  const id = `tipo-inmueble-${tipo.id_tipo_inmueble}`;
                  const isChecked = selected.includes(tipo.id_tipo_inmueble);

                  return (
                    <Label
                      key={tipo.id_tipo_inmueble}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      tabIndex={0}
                      htmlFor={id}
                      onKeyDown={(event) =>
                        handleOptionKeyDown(
                          event,
                          index,
                          tipo.id_tipo_inmueble
                        )
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
                        onCheckedChange={() => toggle(tipo.id_tipo_inmueble)}
                        className={cn(
                          "h-[18px] w-[18px] rounded-full border border-[#8A847C] data-[state=checked]:border-[#1F3A4D] data-[state=checked]:bg-[#1F3A4D]",
                          "[&_svg]:text-white"
                        )}
                      />

                      <span className="select-none text-sm text-[#2E2E2E]">
                        {tipo.nombre_inmueble}
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