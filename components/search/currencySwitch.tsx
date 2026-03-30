"use client";

import { useState} from "react";
import { Button } from "@/components/ui/button";
import type { Currency } from './priceDropdown';


type CurrencySwitchProps = {
    currentCurrency: Currency,
    setCurrentCurrency: (currency: Currency) => void;
}

export default function CurrencySwitch({
    currentCurrency,
    setCurrentCurrency,
}: CurrencySwitchProps) {
    return (
        <div className="flex items-center w-full rounded-lg overflow-hidden border border-border">
            <Button
                className={`w-1/2 ${
                    currentCurrency === "USD"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500"
                        : ""
                } rounded-none rounded-l-lg border-r-0`}
                type="button"
                variant={currentCurrency === "USD" ? "default" : "outline"}
                onClick={() => setCurrentCurrency("USD")}
            >
                USD
            </Button>

            <Button
                className={`w-1/2 ${
                    currentCurrency === "BS"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500"
                        : ""
                } rounded-none rounded-r-lg border-l-0`}
                type="button"
                variant={currentCurrency === "BS" ? "default" : "outline"}
                onClick={() => setCurrentCurrency("BS")}
            >
                BS
            </Button>
        </div>
    );
}