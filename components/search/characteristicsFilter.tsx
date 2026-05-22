"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedFiltersValues {
  habitaciones?: string;
  banos?: string;
  piscina?: string;
  minSurface?: number;
  maxSurface?: number;
  caracteristicasIds?: number[];
  soloOfertas?: boolean;
}

interface CaracteristicaOption {
  id_caracteristica: number;
  nombre_caracteristica: string;
  color?: string | null;
}

interface Props {
  allTags?: CaracteristicaOption[];
  value?: AdvancedFiltersValues;
  onChange: (valores: AdvancedFiltersValues) => void;
}

export default function CharacteristicsFilter({
  allTags = [],
  value,
  onChange,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isModalOpen]);

  const selectedIds = value?.caracteristicasIds ?? [];

  const selectedCharacteristics = allTags.filter((caracteristica) =>
    selectedIds.includes(caracteristica.id_caracteristica),
  );

  const updateCharacteristics = (ids: number[]) => {
    onChange({
      ...value,
      caracteristicasIds: ids,
    });
  };

  const toggleCaracteristica = (id: number) => {
    const nuevos = selectedIds.includes(id)
      ? selectedIds.filter((caracteristicaId) => caracteristicaId !== id)
      : [...selectedIds, id];

    updateCharacteristics(nuevos);
  };

  const removeCaracteristica = (id: number) => {
    updateCharacteristics(
      selectedIds.filter((caracteristicaId) => caracteristicaId !== id),
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsModalOpen(false)}
      />

      <div className="relative z-[10000] flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
          aria-label="Cerrar etiquetas"
        >
          <X size={24} />
        </button>

        <div className="border-b border-gray-100 px-6 py-5 pr-14">
          <h2 className="text-2xl font-bold text-gray-900">
            Seleccionar etiquetas
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Elige una o varias características para filtrar los inmuebles.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 rounded-xl bg-[#F6F4EF] px-4 py-3 text-sm text-[#6B6258]">
            Seleccionadas:{" "}
            <span className="font-semibold text-[#2E2E2E]">
              {selectedIds.length}
            </span>
          </div>

          {allTags.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {allTags.map((caracteristica) => {
                const isSelected = selectedIds.includes(
                  caracteristica.id_caracteristica,
                );

                const tagColor = caracteristica.color ?? "#6B7280";

                return (
                  <button
                    key={caracteristica.id_caracteristica}
                    type="button"
                    onClick={() =>
                      toggleCaracteristica(caracteristica.id_caracteristica)
                    }
                    className={cn(
                      "rounded-xl border-2 px-3 py-3 text-center text-xs font-bold uppercase transition hover:opacity-90",
                      isSelected
                        ? "text-white shadow-md"
                        : "bg-white text-[#2E2E2E]",
                    )}
                    style={{
                      borderColor: tagColor,
                      backgroundColor: isSelected ? tagColor : "white",
                    }}
                  >
                    {caracteristica.nombre_caracteristica}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D8D2C8] bg-white px-6 py-12 text-center text-sm text-[#7A746D]">
              No hay etiquetas disponibles.
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="w-full rounded-lg bg-[#B47B65] py-3 font-bold text-white transition hover:bg-[#A66C57]"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-3 w-full border-t border-[#F4EFE6] pt-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#2E2E2E]">Etiquetas</h3>
          <p className="text-xs text-[#7A746D]">
            Buscar por atributos especiales del inmueble
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg border border-[#C26E5A] bg-white px-3 py-1.5 text-xs font-semibold text-[#C26E5A] transition hover:bg-[#C26E5A] hover:text-white"
        >
          + Seleccionar
        </button>
      </div>

      {selectedCharacteristics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCharacteristics.map((caracteristica) => {
            const tagColor = caracteristica.color ?? "#6B7280";

            return (
              <button
                key={caracteristica.id_caracteristica}
                type="button"
                onClick={() =>
                  removeCaracteristica(caracteristica.id_caracteristica)
                }
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase text-white shadow-sm transition hover:opacity-90"
                style={{
                  backgroundColor: tagColor,
                }}
                title="Quitar etiqueta"
              >
                <span>{caracteristica.nombre_caracteristica}</span>
                <X className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[#7A746D]">
          No hay etiquetas seleccionadas.
        </p>
      )}

      {isMounted && isModalOpen && createPortal(modalContent, document.body)}
    </div>
  );
}