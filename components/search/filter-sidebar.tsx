"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  OperationTypeFilter,
  type OperationType,
} from "@/components/search/operation-type-filter";
import { Button } from "@/components/ui/button";

type FilterSidebarProps = {
  selectedOperation: OperationType;
  onOperationChange: (value: OperationType) => void;
  location: string;
  onLocationChange: (value: string) => void;
  onApply: () => void;
  mobile?: boolean;
  onClose?: () => void;
};

export function FilterSidebar({
  selectedOperation,
  onOperationChange,
  location,
  onLocationChange,
  onApply,
  mobile = false,
  onClose,
}: FilterSidebarProps) {
  return (
    <section className="rounded-[28px] border border-[#d8cec0] bg-white/80 p-5 shadow-[0_18px_45px_-30px_rgba(31,58,77,0.55)] backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C26E5A]">
            Filtros
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#2E2E2E]">Filtros</h2>
          <p className="mt-2 text-sm text-[#5f5a54]">
            Usa esta seccion para definir tu busqueda inmobiliaria.
          </p>
        </div>

        {mobile && onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0 rounded-full text-[#1F3A4D] hover:bg-[#F4EFE6]"
            aria-label="Cerrar filtros"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b746b]">
            Filtros basicos
          </p>

          <label className="block">
            <span className="sr-only">Buscar por ubicacion</span>
            <div className="flex items-center gap-3 rounded-2xl border border-[#cfc4b6] bg-[#F8F3EC] px-4 py-3 shadow-sm">
              <Search className="size-4 text-[#7b746b]" />
              <input
                type="text"
                value={location}
                onChange={(event) => onLocationChange(event.target.value)}
                placeholder="Buscar por ubicacion"
                className="w-full bg-transparent text-sm text-[#2E2E2E] outline-none placeholder:text-[#8a847d]"
              />
            </div>
          </label>
        </div>

        <Button
          type="button"
          onClick={onApply}
          className="h-11 w-full rounded-2xl bg-[#1F3A4D] text-sm font-medium text-[#F4EFE6] hover:bg-[#27485f]"
        >
          Aplicar filtros
        </Button>

        <div className="rounded-[24px] bg-[#F4EFE6] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1F3A4D]">
            <SlidersHorizontal className="size-4" />
            <span>Tipo de operacion</span>
          </div>

          <OperationTypeFilter
            value={selectedOperation}
            onChange={onOperationChange}
          />
        </div>
      </div>
    </section>
  );
}
