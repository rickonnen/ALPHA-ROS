"use client";

import { X } from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  convertUsdToBs,
  useCurrentExchangeRate,
} from "@/features/filter_search_page/currencyConverter";
import CurrencySwitch from "./currencySwitch";
import { useDollarRate } from "@/components/hooks/getDollarRate";
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
  const exchangeRate = useCurrentExchangeRate();

  const [priceError, setPriceError] = useState<string | null>(null);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [accordionValue, setAccordionValue] = useState("");

  const { compra } = useDollarRate();

  const previousCurrencyRef = useRef<Currency>(selectedCurrency);
  const previousAppliedFilterRef = useRef<AppliedPriceFilter | null>(
    appliedPriceFilter
  );

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const maxInputRef = useRef<HTMLInputElement | null>(null);

  const maxAllowedPrice = 999999999;

  const isValidPriceInput = (value: string) => {
    return value === "" || /^\d*\.?\d*$/.test(value);
  };

  const sanitizeZeroLikeValue = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") return "";
    if (trimmedValue === ".") return "";

    const parsed = Number(trimmedValue);

    if (!Number.isNaN(parsed) && parsed <= 0) return "";

    return trimmedValue;
  };

  const formatInputValue = (value: number) => {
    if (!Number.isFinite(value)) return "";

    return String(value);
  };

  const formatConvertedInputValue = (value: number) => {
    if (!Number.isFinite(value)) return "";

    const roundedValue = Math.round(value * 100) / 100;

    return Number.isInteger(roundedValue)
      ? String(roundedValue)
      : roundedValue.toFixed(2);
  };

  const normalizedMinInput = sanitizeZeroLikeValue(minPriceInput);
  const normalizedMaxInput = sanitizeZeroLikeValue(maxPriceInput);

  const handlePriceInputChange =
    (field: "min" | "max") => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();

      if (!isValidPriceInput(value)) {
        setPriceError("Solo se permiten números y decimales");
        return;
      }

      setPriceError(null);

      if (field === "min") {
        setMinPriceInput(value);
      } else {
        setMaxPriceInput(value);
      }
    };

  const applyRange = () => {
    const safeMinValue = sanitizeZeroLikeValue(minPriceInput);
    const safeMaxValue = sanitizeZeroLikeValue(maxPriceInput);

    if (safeMinValue !== minPriceInput) {
      setMinPriceInput(safeMinValue);
    }

    if (safeMaxValue !== maxPriceInput) {
      setMaxPriceInput(safeMaxValue);
    }

    const parsedMinPrice =
      safeMinValue.trim() === "" ? undefined : Number(safeMinValue);

    const parsedMaxPrice =
      safeMaxValue.trim() === "" ? undefined : Number(safeMaxValue);

    if (selectedCurrency !== "USD" && selectedCurrency !== "BS") {
      setPriceError("Moneda inválida");
      return false;
    }

    if (parsedMinPrice !== undefined && Number.isNaN(parsedMinPrice)) {
      setPriceError("Precio mínimo debe ser un número");
      return false;
    }

    if (parsedMaxPrice !== undefined && Number.isNaN(parsedMaxPrice)) {
      setPriceError("Precio máximo debe ser un número");
      return false;
    }

    if (parsedMinPrice !== undefined && parsedMinPrice > maxAllowedPrice) {
      setPriceError("Precio mínimo excede el valor máximo permitido");
      return false;
    }

    if (parsedMaxPrice !== undefined && parsedMaxPrice > maxAllowedPrice) {
      setPriceError("Precio máximo excede el valor máximo permitido");
      return false;
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice >= parsedMaxPrice
    ) {
      setPriceError("Precio mínimo debe ser menor al precio máximo");
      return false;
    }

    const normalizedMinPrice =
      parsedMinPrice === undefined
        ? undefined
        : selectedCurrency === "BS"
          ? parsedMinPrice / exchangeRate
          : parsedMinPrice;

    const normalizedMaxPrice =
      parsedMaxPrice === undefined
        ? undefined
        : selectedCurrency === "BS"
          ? parsedMaxPrice / exchangeRate
          : parsedMaxPrice;

    setPriceError(null);

    onApplyRange({
      minPrice: normalizedMinPrice,
      maxPrice: normalizedMaxPrice,
    });

    return true;
  };

  const handleInputBlur = () => {
    applyRange();
  };

  const handleMinInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      applyRange();

      requestAnimationFrame(() => {
        maxInputRef.current?.focus();
      });
    }
  };

  const handleMaxInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const success = applyRange();

      if (success) {
        setAccordionValue("");

        requestAnimationFrame(() => {
          triggerButtonRef.current?.focus();
        });
      }
    }
  };

  const formatPriceValue = (value: number) => {
    return value.toLocaleString("es-BO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getTriggerLabel = () => {
    const parsedMinInput =
      normalizedMinInput.trim() === "" ? undefined : Number(normalizedMinInput);

    const parsedMaxInput =
      normalizedMaxInput.trim() === "" ? undefined : Number(normalizedMaxInput);

    const formatFilterValue = (value?: number) => {
      if (value === undefined) return undefined;

      return selectedCurrency === "BS"
        ? convertUsdToBs(value, exchangeRate)
        : value;
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
      return `${selectedCurrency} ${formatPriceValue(
        minPrice
      )} - ${formatPriceValue(maxPrice)}`;
    }

    if (hasMinPrice) {
      return `${selectedCurrency} desde ${formatPriceValue(minPrice)}`;
    }

    return `${selectedCurrency} hasta ${formatPriceValue(maxPrice!)}`;
  };

  const triggerLabel = getTriggerLabel();
  const triggerLabelTruncated =
    triggerLabel.length > 28 ? `${triggerLabel.slice(0, 28)}...` : triggerLabel;

  const hasActivePriceFilter =
    appliedPriceFilter?.minPrice !== undefined ||
    appliedPriceFilter?.maxPrice !== undefined ||
    minPriceInput.trim() !== "" ||
    maxPriceInput.trim() !== "";

  const clearPriceFilter = () => {
    setPriceError(null);
    setMinPriceInput("");
    setMaxPriceInput("");

    onApplyRange({
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  useEffect(() => {
    const previousCurrency = previousCurrencyRef.current;

    if (previousCurrency === selectedCurrency) return;

    const convertValue = (value: string) => {
      const safeValue = sanitizeZeroLikeValue(value);

      if (safeValue.trim() === "") return "";

      const parsedValue = Number(safeValue);

      if (Number.isNaN(parsedValue)) return "";

      if (previousCurrency === "USD" && selectedCurrency === "BS") {
        return formatConvertedInputValue(
          convertUsdToBs(parsedValue, exchangeRate)
        );
      }

      if (previousCurrency === "BS" && selectedCurrency === "USD") {
        return formatConvertedInputValue(parsedValue / exchangeRate);
      }

      return safeValue;
    };

    setMinPriceInput((prev) => convertValue(prev));
    setMaxPriceInput((prev) => convertValue(prev));

    previousCurrencyRef.current = selectedCurrency;
    setPriceError(null);
  }, [selectedCurrency, exchangeRate]);

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
        return formatConvertedInputValue(
          convertUsdToBs(value, exchangeRate)
        );
      }

      return formatConvertedInputValue(value);
    };

    setMinPriceInput(formatValueForInput(minFromFilter));
    setMaxPriceInput(formatValueForInput(maxFromFilter));

    previousAppliedFilterRef.current = appliedPriceFilter;
  }, [appliedPriceFilter, selectedCurrency, exchangeRate]);

  return (
    <div className="mt-3 w-full">
      <div className="mb-4 hidden md:block">
        <CurrencySwitch
          currentCurrency={selectedCurrency}
          setCurrentCurrency={onCurrencyChange}
        />
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full rounded-lg"
        value={accordionValue}
        onValueChange={setAccordionValue}
      >
        <AccordionItem value="price" className="border-none">
          <div className="relative overflow-hidden rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              ref={triggerButtonRef}
              className={cn(
                "relative flex w-full items-center px-4 py-3 pr-20 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:-translate-y-1/2 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              <span className="block w-full max-w-full overflow-hidden truncate whitespace-nowrap pr-2 text-left">
                {triggerLabelTruncated}
              </span>
            </AccordionTrigger>

            {hasActivePriceFilter && (
              <button
                type="button"
                aria-label="Limpiar filtro de precio"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearPriceFilter();
                }}
                className="absolute right-8 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-colors hover:bg-[#DEDAD3]"
              >
                <X className="h-4 w-4 text-[#5E5A55]" />
              </button>
            )}
          </div>

          <AccordionContent className="pb-0 pt-3">
            <div className="w-full rounded-lg border border-[#C8C0B5] bg-white p-4 shadow-sm">
              <div className="flex justify-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={`Min ${selectedCurrency}`}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#7A756D]",
                    priceError ? "border-red-500" : "border-[#C8C0B5]"
                  )}
                  value={minPriceInput}
                  onChange={handlePriceInputChange("min")}
                  onBlur={handleInputBlur}
                  onKeyDown={handleMinInputKeyDown}
                />

                <input
                  ref={maxInputRef}
                  type="text"
                  inputMode="decimal"
                  placeholder={`Max ${selectedCurrency}`}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-white px-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#7A756D]",
                    priceError ? "border-red-500" : "border-[#C8C0B5]"
                  )}
                  value={maxPriceInput}
                  onChange={handlePriceInputChange("max")}
                  onBlur={handleInputBlur}
                  onKeyDown={handleMaxInputKeyDown}
                />
              </div>

              <div className={priceError ? "mt-2 block" : "hidden"}>
                <p className="text-center text-sm text-red-600">
                  {priceError}
                </p>
              </div>

              <div className="mt-3 w-full">
                <p className="text-center text-xs text-[#8c6c4c]">
                  Tipo de cambio paralelo: Bs. {compra}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}