"use client";

import * as React from "react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SortSelect({
  onSortChange,
}: {
  onSortChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined,
  );

  return (
    <div className="flex w-full items-center gap-2 md:mt-3">
      {selectedValue && (
        <p className="shrink-0 whitespace-nowrap text-xs font-medium text-[#2E2E2E] md:text-sm">
          Ordenado por:
        </p>
      )}

      <Select
        key={selectedValue || "reset"}
        value={selectedValue}
        onOpenChange={setIsOpen}
        onValueChange={(val) => {
          setSelectedValue(val);
          onSortChange(val);
        }}
      >
        <SelectTrigger
          className={cn(
            "min-w-0 flex-1 h-10 md:h-20 flex items-center justify-between px-3 md:px-4 py-4.25 md:py-5",
            "rounded-lg border border-[#B9B1A5] bg-white shadow-sm",
            "text-xs md:text-sm font-normal text-[#2E2E2E] focus:ring-0 focus:ring-offset-0",
            "[&>svg]:hidden",
          )}
        >
          <SelectValue placeholder="Ordenar por" />

          <div className="flex items-center gap-3">
            {selectedValue && (
              <span
                role="button"
                className="relative z-[100] p-1 hover:bg-[#DDD7CD] rounded-full transition-colors cursor-pointer flex items-center justify-center"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedValue(undefined);
                  onSortChange("");
                }}
              >
                <X
                  size={16}
                  className="text-[#4B4B4B] hover:text-[#5E5A55] transition-colors"
                />
              </span>
            )}

            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#4B4B4B] transition-transform duration-300",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </div>
        </SelectTrigger>

        <SelectContent
          position="popper"
          sideOffset={4}
          className="w-[var(--radix-select-trigger-width)] bg-white border border-[#C8C0B5] rounded-[16px] shadow-md overflow-hidden p-1"
        >
          <SelectItem
            value="precio-asc"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Precio (menor a mayor)
          </SelectItem>

          <SelectItem
            value="precio-des"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Precio (mayor a menor)
          </SelectItem>

          <SelectItem
            value="rebajas-desc"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Rebajas (mayor a menor)
          </SelectItem>

          <SelectItem
            value="fecha-reciente"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Fecha de publicación (más reciente)
          </SelectItem>

          <SelectItem
            value="fecha-antigua"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Fecha de publicación (más antigua)
          </SelectItem>

          <SelectItem
            value="m2-mayor"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Superficie m² (mayor a menor)
          </SelectItem>

          <SelectItem
            value="m2-menor"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Superficie m² (menor a mayor)
          </SelectItem>

          <SelectItem
            value="mas-recomendados"
            className="text-sm py-2.5 focus:bg-[#F4EFE6] focus:text-[#1F3A4D] cursor-pointer rounded-[12px]"
          >
            Mis Recomendados
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}