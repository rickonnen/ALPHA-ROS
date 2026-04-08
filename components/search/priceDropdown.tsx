"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { convertUsdToBs, convertBsToUsd } from "@/features/filter_search_page/currencyConverter";
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
  const previousCurrencyRef = useRef<Currency>(selectedCurrency);
  const previousAppliedFilterRef = useRef<AppliedPriceFilter | null>(appliedPriceFilter);

  const maxAllowedPrice = 999999999;

  const handlePriceInputChange =
    (field: "min" | "max") => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (value === "") {
        setPriceError(null);

        if (field === "min") {
          setMinPriceInput("");
        } else {
          setMaxPriceInput("");
        }
        return;
      }

      const onlyDigits = /^\d+$/.test(value);

      if (!onlyDigits) {
        setPriceError("Solo se permiten números");
        return;
      }

      setPriceError(null);

      if (field === "min") {
        setMinPriceInput(value);
      } else {
        setMaxPriceInput(value);
      }
    };

  const handleApplyRange = () => {
    const parsedMinPrice =
      minPriceInput.trim() === "" ? undefined : Number(minPriceInput);

    const parsedMaxPrice =
      maxPriceInput.trim() === "" ? undefined : Number(maxPriceInput);

    if (selectedCurrency !== "USD" && selectedCurrency !== "BS") {
      setPriceError("Moneda inválida");
      return;
    }

    if (parsedMinPrice !== undefined && Number.isNaN(parsedMinPrice)) {
      setPriceError("Precio mínimo debe ser un número");
      return;
    }

    if (parsedMaxPrice !== undefined && Number.isNaN(parsedMaxPrice)) {
      setPriceError("Precio máximo debe ser un número");
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
      setPriceError("Precio mínimo excede el valor máximo permitido");
      return;
    }

    if (parsedMaxPrice !== undefined && parsedMaxPrice > maxAllowedPrice) {
      setPriceError("Precio máximo excede el valor máximo permitido");
      return;
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      setPriceError("Precio mínimo no puede ser mayor a precio máximo");
      return;
    }

    const normalizedMinPrice =
      parsedMinPrice === undefined
        ? undefined
        : selectedCurrency === "BS"
          ? convertBsToUsd(parsedMinPrice)
          : parsedMinPrice;

    const normalizedMaxPrice =
      parsedMaxPrice === undefined
        ? undefined
        : selectedCurrency === "BS"
          ? convertBsToUsd(parsedMaxPrice)
          : parsedMaxPrice;

    setPriceError(null);

    onApplyRange({
      minPrice: normalizedMinPrice,
      maxPrice: normalizedMaxPrice,
    });

    setAccordionValue("");
  };

  const formatPriceValue = (value: number) => {
    const displayValue =
      selectedCurrency === "BS" ? Math.round(value) : value;

    return displayValue.toLocaleString("es-BO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: selectedCurrency === "BS" ? 0 : 2,
    });
  };

  const getTriggerLabel = () => {
    const parsedMinInput =
      minPriceInput.trim() === "" ? undefined : Number(minPriceInput);
    const parsedMaxInput =
      maxPriceInput.trim() === "" ? undefined : Number(maxPriceInput);

    const formatFilterValue = (value?: number) => {
      if (value === undefined) return undefined;
      return selectedCurrency === "BS" ? convertUsdToBs(value) : value;
    };

    const minPrice =
      parsedMinInput !== undefined && !Number.isNaN(parsedMinInput)
        ? parsedMinInput
        : formatFilterValue(appliedPriceFilter?.minPrice);

    const maxPrice =
      parsedMaxInput !== undefined && !Number.isNaN(parsedMaxInput)
        ? parsedMaxInput
        : formatFilterValue(appliedPriceFilter?.maxPrice);

    const hasMinPrice = minPrice !== undefined;
    const hasMaxPrice = maxPrice !== undefined;

    if (!hasMinPrice && !hasMaxPrice) {
      return "Precio";
    }

    if (hasMinPrice && hasMaxPrice) {
      return `${selectedCurrency} ${formatPriceValue(minPrice)} - ${formatPriceValue(maxPrice)}`;
    }

    if (hasMinPrice) {
      return `${selectedCurrency} desde ${formatPriceValue(minPrice)}`;
    }

    return `${selectedCurrency} hasta ${formatPriceValue(maxPrice!)}`;
  };

  useEffect(() => {
    const previousCurrency = previousCurrencyRef.current;

    if (previousCurrency === selectedCurrency) return;

    const convertValue = (value: string) => {
      if (value.trim() === "") return "";

      const parsedValue = Number(value);

      if (Number.isNaN(parsedValue)) return "";

      if (previousCurrency === "USD" && selectedCurrency === "BS") {
        return String(Math.round(convertUsdToBs(parsedValue)));
      }

      if (previousCurrency === "BS" && selectedCurrency === "USD") {
        return String(convertBsToUsd(parsedValue));
      }

      return value;
    };

    setMinPriceInput((prev) => convertValue(prev));
    setMaxPriceInput((prev) => convertValue(prev));

    previousCurrencyRef.current = selectedCurrency;
    setPriceError(null);
  }, [selectedCurrency]);

  useEffect(() => {
    const minFromFilter = appliedPriceFilter?.minPrice;
    const maxFromFilter = appliedPriceFilter?.maxPrice;

    const hasFilterValues =
      minFromFilter !== undefined || maxFromFilter !== undefined;

    const previousMin = previousAppliedFilterRef.current?.minPrice;
    const previousMax = previousAppliedFilterRef.current?.maxPrice;

    const previousHadFilterValues =
      previousMin !== undefined || previousMax !== undefined;

    if (!hasFilterValues) {
      if (previousHadFilterValues) {
        setMinPriceInput("");
        setMaxPriceInput("");
      }

      previousAppliedFilterRef.current = appliedPriceFilter;
      return;
    }

    const formatValueForInput = (value?: number) => {
      if (value === undefined) return "";

      if (selectedCurrency === "BS") {
        return String(Math.round(convertUsdToBs(value)));
      }

      return String(value);
    };

    setMinPriceInput(formatValueForInput(minFromFilter));
    setMaxPriceInput(formatValueForInput(maxFromFilter));

    previousAppliedFilterRef.current = appliedPriceFilter;
  }, [appliedPriceFilter, selectedCurrency]);

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
                  type="text"
                  inputMode="numeric"
                  placeholder={`Min ${selectedCurrency}`}
                  className={cn(
                    "h-10 w-full rounded-[12px] border bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#7A756D]",
                    priceError === "Solo se permiten números" ||
                      priceError?.toLowerCase().includes("mínimo") ||
                      priceError?.toLowerCase().includes("minimo")
                      ? "border-red-500"
                      : "border-[#C8C0B5]"
                  )}
                  value={minPriceInput}
                  onChange={handlePriceInputChange("min")}
                />

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={`Max ${selectedCurrency}`}
                  className={cn(
                    "h-10 w-full rounded-[12px] border bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#7A756D]",
                    priceError === "Solo se permiten números" ||
                      priceError?.toLowerCase().includes("máximo") ||
                      priceError?.toLowerCase().includes("maximo")
                      ? "border-red-500"
                      : "border-[#C8C0B5]"
                  )}
                  value={maxPriceInput}
                  onChange={handlePriceInputChange("max")}
                />
              </div>

              <div className={priceError ? "mt-2 block" : "hidden"}>
                <p className="text-center text-sm text-red-600">{priceError}</p>
              </div>

              <Button
                className={cn(
                  "mt-4 h-10 w-full rounded-[12px] bg-[#1F3A4D] text-base text-white hover:bg-[#C26E5A]",
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