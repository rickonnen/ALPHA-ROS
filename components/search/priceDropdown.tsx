"use client";

import { useState } from "react";
import CurrencySwitch from "./currencySwitch";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type Currency = "USD" | "BS";

type AppliedPriceFilter = {
  minPrice?: number;
  maxPrice?: number;
};

type PriceDropdownProps = {
  selectedCurrency: Currency;
  appliedPriceFilter: AppliedPriceFilter | null;
  onCurrencyChange: (currency: Currency) => void;
  onApplyRange: (filter: AppliedPriceFilter) => void;
};

export default function PriceDropdown({
  selectedCurrency,
  appliedPriceFilter,
  onCurrencyChange,
  onApplyRange,
}: PriceDropdownProps) {
  const [priceError, setPriceError] = useState<string | null>(null);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [accordionValue, setAccordionValue] = useState("");
  const [hasAppliedRange, setHasAppliedRange] = useState(false);

  const maxAllowedPrice = 999999999;

  const handleApplyRange = () => {
    const parsedMinPrice =
      minPriceInput.trim() === "" ? undefined : Number(minPriceInput);

    const parsedMaxPrice =
      maxPriceInput.trim() === "" ? undefined : Number(maxPriceInput);

    if (selectedCurrency !== "USD" && selectedCurrency !== "BS") {
      setPriceError("Moneda invalida");
      return;
    }

    if (parsedMinPrice !== undefined && Number.isNaN(parsedMinPrice)) {
      setPriceError("Precio minimo debe ser un numero");
      return;
    }

    if (parsedMaxPrice !== undefined && Number.isNaN(parsedMaxPrice)) {
      setPriceError("Precio máximo debe ser un numero");
      return;
    }

    if (parsedMinPrice !== undefined && parsedMinPrice < 0) {
      setPriceError("Precio mínimo no puede ser negativo");
      return;
    }

    if (parsedMaxPrice !== undefined && parsedMaxPrice < 0) {
      setPriceError("Precio máximo no puede ser negativo");
      return;
    }

    if (parsedMinPrice !== undefined && parsedMinPrice > maxAllowedPrice) {
      setPriceError("Precio mínimo excede el valor maximo permitido");
      return;
    }

    if (parsedMaxPrice !== undefined && parsedMaxPrice > maxAllowedPrice) {
      setPriceError("Precio máximo excede el valor maximo permitido");
      return;
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      setPriceError("Precio mínimo no puede ser mayor a precio maximo");
      return;
    }

    setPriceError(null);

    onApplyRange({
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
    });

    setAccordionValue("");
    setHasAppliedRange(true);
  };

  const formatPriceValue = (value: number) => {
    return value.toLocaleString("es-BO");
  };

  const getTriggerLabel = () => {
    if (!hasAppliedRange) {
      return "Precio";
    }

    const minPrice = appliedPriceFilter?.minPrice;
    const maxPrice = appliedPriceFilter?.maxPrice;

    const hasMinPrice = minPrice !== undefined;
    const hasMaxPrice = maxPrice !== undefined;

    if (!hasMinPrice && !hasMaxPrice) {
      return selectedCurrency;
    }

    if (hasMinPrice && hasMaxPrice) {
      return `${selectedCurrency} ${formatPriceValue(minPrice)} - ${formatPriceValue(maxPrice)}`;
    }

    if (hasMinPrice) {
      return `${selectedCurrency} desde ${formatPriceValue(minPrice)}`;
    }

    return `${selectedCurrency} hasta ${formatPriceValue(maxPrice!)}`;
  };

  return (
    <div className="w-full mt-3">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="price" className="border-none">
          <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              {getTriggerLabel()}
            </AccordionTrigger>
          </div>

          <AccordionContent className="pt-3 pb-0">
            <div className="w-full rounded-[16px] border border-[#C8C0B5] bg-white p-4 shadow-sm">
              <CurrencySwitch
                currentCurrency={selectedCurrency}
                setCurrentCurrency={onCurrencyChange}
              />

              <div className="mt-3 flex justify-center gap-2">
                <input
                  type="number"
                  placeholder={`Min ${selectedCurrency}`}
                  className={cn(
                    "h-10 w-full rounded-[12px] border bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#7A756D]",
                    priceError?.toLowerCase().includes("mínimo") ||
                      priceError?.toLowerCase().includes("minimo")
                      ? "border-red-500"
                      : "border-[#C8C0B5]"
                  )}
                  value={minPriceInput}
                  onChange={(e) => {
                    setMinPriceInput(e.target.value);
                    setPriceError(null);
                  }}
                />

                <input
                  type="number"
                  placeholder={`Max ${selectedCurrency}`}
                  className={cn(
                    "h-10 w-full rounded-[12px] border bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#7A756D]",
                    priceError?.toLowerCase().includes("máximo") ||
                      priceError?.toLowerCase().includes("maximo")
                      ? "border-red-500"
                      : "border-[#C8C0B5]"
                  )}
                  value={maxPriceInput}
                  onChange={(e) => {
                    setMaxPriceInput(e.target.value);
                    setPriceError(null);
                  }}
                />
              </div>

              <div className={priceError ? "mt-2 block" : "hidden"}>
                <p className="text-center text-sm text-red-600">{priceError}</p>
              </div>

              <Button
                className={cn(
                  "mt-4 w-full h-10 rounded-[12px] bg-[#1F3A4D] text-base text-white hover:bg-[#C26E5A]",
                  priceError && "mt-3"
                )}
                type="button"
                onClick={handleApplyRange}
              >
                Aplicar rango
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}