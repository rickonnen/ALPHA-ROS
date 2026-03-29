"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { FilterSidebar } from "@/components/search/filter-sidebar";
import {
  type OperationType,
  operationTypeOptions,
} from "@/components/search/operation-type-filter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockProperties = [
  {
    id: 1,
    title: "Departamento con balcon en Cala Cala",
    price: "Bs. 540.000",
    detail: "2 dormitorios - 112 m2",
    location: "Cala Cala",
    operation: "venta",
  },
  {
    id: 2,
    title: "Casa familiar con jardin en Tiquipaya",
    price: "Bs. 980.000",
    detail: "4 dormitorios - 340 m2",
    location: "Tiquipaya",
    operation: "venta",
  },
  {
    id: 3,
    title: "Monoambiente listo para alquiler en Queru Queru",
    price: "Bs. 2.300/mes",
    detail: "1 dormitorio - 42 m2",
    location: "Queru Queru",
    operation: "alquiler",
  },
  {
    id: 4,
    title: "Departamento familiar en Sarco",
    price: "Bs. 610.000",
    detail: "3 dormitorios - 125 m2",
    location: "Sarco",
    operation: "venta",
  },
  {
    id: 5,
    title: "Casa minimalista cerca del centro",
    price: "Bs. 760.000",
    detail: "3 dormitorios - 250 m2",
    location: "Centro",
    operation: "venta",
  },
  {
    id: 6,
    title: "Loft moderno con terraza panoramica",
    price: "Bs. 3.100/mes",
    detail: "2 dormitorios - 88 m2",
    location: "Queru Queru",
    operation: "alquiler",
  },
] as const;

export function SearchPageShell() {
  const [selectedOperation, setSelectedOperation] =
    useState<OperationType>("venta");
  const [location, setLocation] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [appliedOperation, setAppliedOperation] =
    useState<OperationType>("venta");
  const [appliedLocation, setAppliedLocation] = useState("");

  const appliedOperationLabel =
    operationTypeOptions.find((option) => option.value === appliedOperation)
      ?.label ?? "Operacion";

  const filteredProperties = mockProperties.filter((property) => {
    const matchesOperation = property.operation === appliedOperation;
    const matchesLocation = appliedLocation
      ? property.location.toLowerCase().includes(appliedLocation.toLowerCase())
      : true;

    return matchesOperation && matchesLocation;
  });

  const showEmptyOperationMessage = filteredProperties.length === 0;

  const handleApplyFilters = () => {
    setAppliedOperation(selectedOperation);
    setAppliedLocation(location.trim());
    setMobileFiltersOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#2E2E2E]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="lg:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={() => setMobileFiltersOpen(true)}
            className="h-auto rounded-full border-[#cfc4b6] bg-white px-4 py-3 text-[#1F3A4D] hover:bg-[#F8F3EC]"
          >
            <SlidersHorizontal className="size-4" />
            Ver filtros
          </Button>
        </div>

        <section className={cn("grid gap-6", "lg:grid-cols-[300px_minmax(0,1fr)]")}>
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <FilterSidebar
                selectedOperation={selectedOperation}
                onOperationChange={setSelectedOperation}
                location={location}
                onLocationChange={setLocation}
                onApply={handleApplyFilters}
              />
            </div>
          </aside>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#d8cec0] bg-white/80 p-5 shadow-[0_18px_45px_-35px_rgba(31,58,77,0.55)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C26E5A]">
                Navegacion
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-[#5f5a54]">
                    Inicio / Publicaciones / {appliedOperationLabel}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-[#1F3A4D]">
                    {filteredProperties.length}{" "}
                    {filteredProperties.length === 1
                      ? "coincidencia"
                      : "coincidencias"}
                  </h1>
                </div>

                <div className="rounded-2xl bg-[#F4EFE6] px-4 py-3 text-sm text-[#5f5a54]">
                  <p className="font-medium text-[#2E2E2E]">
                    Tipo de operacion: {appliedOperationLabel}
                  </p>
                  <p className="mt-1">
                    {appliedLocation
                      ? `Ubicacion: ${appliedLocation}`
                      : "Ubicacion: todas"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[28px] border border-[#d8cec0] bg-white/80 p-5 shadow-[0_18px_45px_-35px_rgba(31,58,77,0.55)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1F3A4D]">
                  Resultados sugeridos
                </p>
                <p className="mt-1 text-sm text-[#5f5a54]">
                  Vista centrada en tu HU del dropdown de tipo de operacion.
                </p>
              </div>

              <div className="rounded-full bg-[#F4EFE6] px-4 py-2 text-sm font-medium text-[#2E2E2E]">
                {filteredProperties.length} resultados
              </div>
            </div>

            {showEmptyOperationMessage ? (
              <div className="rounded-[24px] border border-[#d8cec0] bg-[#F8F3EC] px-5 py-4 text-sm font-medium text-[#1F3A4D] shadow-[0_12px_30px_-28px_rgba(31,58,77,0.65)]">
                No hay inmuebles disponibles para esta operacion
              </div>
            ) : null}

            {filteredProperties.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProperties.map((property) => {
                  const propertyOperationLabel =
                    operationTypeOptions.find(
                      (option) => option.value === property.operation,
                    )?.label ?? "Operacion";

                  return (
                    <article
                      key={property.id}
                      className="overflow-hidden rounded-[28px] border border-[#d8cec0] bg-white shadow-[0_20px_55px_-42px_rgba(31,58,77,0.7)] transition hover:-translate-y-0.5"
                    >
                      <div className="h-44 bg-[linear-gradient(135deg,#d9d2c6,#b9c7d1)]" />
                      <div className="space-y-3 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-[#F4EFE6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#C26E5A]">
                            {propertyOperationLabel}
                          </span>
                          <span className="text-sm font-semibold text-[#1F3A4D]">
                            {property.price}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-[#2E2E2E]">
                            {property.title}
                          </h3>
                          <p className="mt-1 text-sm text-[#5f5a54]">
                            {property.detail}
                          </p>
                          <p className="mt-2 text-sm text-[#7b746b]">
                            {property.location}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            className="absolute inset-0 bg-[#1F3A4D]/30 backdrop-blur-[2px]"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Panel de filtros"
            className="absolute inset-x-4 top-4 rounded-[28px] border border-[#d8cec0] bg-[#F4EFE6] p-3 shadow-2xl"
          >
            <FilterSidebar
              mobile
              selectedOperation={selectedOperation}
              onOperationChange={setSelectedOperation}
              location={location}
              onLocationChange={setLocation}
              onApply={handleApplyFilters}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
