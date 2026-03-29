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

export default function PriceDropdown(){

    const [currentCurrency, setCurrentCurrency] = useState<Currency>("USD");

    const [priceError, setPriceError] = useState<string | null>(null);
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");

    const maxAllowedPrice = 999999999;

    const handleApplyRange = () => {
        const parsedMinPrice =
            minPriceInput.trim() === "" ? undefined : Number(minPriceInput);

        const parsedMaxPrice =
            maxPriceInput.trim() === "" ? undefined : Number(maxPriceInput);

        if (currentCurrency !== "USD" && currentCurrency !== "BS") {
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
    };

    return (
        <div className="w-full max-w-lg">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="price" className="border-none ">

                    <div className="border-2 border-[#1F3A4D] rounded-xl w-full overflow-hidden bg-[#E7E1D7]">
                        <AccordionTrigger className="text-xl justify-center px-2">
                            Precio
                        </AccordionTrigger>
                    </div>

                    <AccordionContent className="pt-2">
                        <div className="flex flex-col p-4 border-2 border-[#1F3A4D] rounded-xl">
                            <CurrencySwitch 
                                currentCurrency={currentCurrency}
                                setCurrentCurrency={setCurrentCurrency}
                            />
                            <div className="flex justify-center gap-1 mt-3">
                                <input
                                    type="number"
                                    placeholder={`Min ${currentCurrency}`}
                                    className={`border w-full h-7 bg-[#F4EFE6] rounded-sm ${
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
                                    placeholder={`Max ${currentCurrency}`}
                                    className={`border w-full h-7 bg-[#F4EFE6] rounded-sm ${
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
                                className={`w-full hover:bg-black ${priceError ? "mt-3" : "mt-4"}`}
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