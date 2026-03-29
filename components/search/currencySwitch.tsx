"use client";

import { useState} from "react";
import { Button } from "@/components/ui/button";
import type { Currency } from './priceDropdown';


type CurrencySwitchProps = {
    currentCurrency: Currency,
    setCurrentCurrency: React.Dispatch<React.SetStateAction<Currency>>;
}

export default function CurrencySwitch({
    currentCurrency,
    setCurrentCurrency,
}: CurrencySwitchProps) {
    return (
        <div className="flex items-center">
            <Button 
                className = "flex-1/2 rounded-l-lg rounded-r-none border-r-0"
                type="button" 
                variant={currentCurrency === "USD" ? "default" : "outline"}
                onClick={() => setCurrentCurrency("USD")}
            > 
                USD 
            </Button>

            <Button 
                className = "flex-1/2 rounded-l-none rounded-r-lg border-l-0 w-full"
                type="button" 
                variant={currentCurrency === "BS" ? "default" : "outline"}
                onClick={() => setCurrentCurrency("BS")}
            > 
                BS
            </Button>

        </div>
    );
}