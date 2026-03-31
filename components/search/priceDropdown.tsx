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

export type Currency = "USD" | "BS";

type AppliedPriceFilter = {
    minPrice?: number;
    maxPrice?: number;
}

type PriceDropdownProps = {
    selectedCurrency: Currency;
    appliedPriceFilter: AppliedPriceFilter | null;
    onCurrencyChange: (currency: Currency) => void;
    onApplyRange: (filter: AppliedPriceFilter) => void;
}

export default function PriceDropdown({ 
        selectedCurrency,
        appliedPriceFilter,
        onCurrencyChange,
        onApplyRange 
    }: PriceDropdownProps){

    const [priceError, setPriceError] = useState<string | null>(null);
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");
    const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);
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

        setAccordionValue(undefined);
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
        <div className="w-full  max-w-lg mt-3">
            <Accordion 
                type="single" 
                collapsible 
                className="w-full "
                value={accordionValue}
                onValueChange={(value) => setAccordionValue(value || undefined)}
            >
                <AccordionItem value="price" className="border-none ">

                    <div className="  rounded-xl w-full overflow-hidden bg-[#F4EFE6]">
                        <AccordionTrigger className="text-sm text-black text-left px-4 py-3">
                            {getTriggerLabel()}
                        </AccordionTrigger>
                    </div>

                    <AccordionContent className="pt-2 ">
                        <div className="flex flex-col p-4 border-2  rounded-xl bg-white ">
                            <CurrencySwitch 
                                currentCurrency={selectedCurrency}
                                setCurrentCurrency={onCurrencyChange}
                            />
                            <div className="flex justify-center gap-1 mt-3 ">
                                <input
                                    type="number"
                                    placeholder={`Min ${selectedCurrency}`}
                                    className={`border w-full h-7 bg-white rounded-sm pl-2 text-left ${
                                        priceError?.toLowerCase().includes("mínimo") ||
                                        priceError?.toLowerCase().includes("minimo")
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                    value={minPriceInput}
                                    onChange={(e) => {
                                        setMinPriceInput(e.target.value);
                                        setPriceError(null);
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder={`Max ${selectedCurrency}`}
                                    className={`border w-full h-7 bg-white rounded-sm pl-2 text-left ${
                                        priceError?.toLowerCase().includes("máximo") ||
                                        priceError?.toLowerCase().includes("maximo")
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                    value={maxPriceInput}
                                    onChange={(e) => {
                                        setMaxPriceInput(e.target.value);
                                        setPriceError(null);
                                    }}
                                />
                            </div>

                            <div className={priceError ? "block mt-2" : "hidden"}>
                                <p className="text-sm text-red-600 text-center">{priceError}</p>
                            </div>

                            <Button
                                className={`w-full text-base hover:bg-black ${priceError ? "mt-3" : "mt-4"}`}
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