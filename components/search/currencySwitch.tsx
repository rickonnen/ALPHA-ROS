"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Currency } from "./priceDropdown";

type CurrencySwitchProps = {
  currentCurrency: Currency;
  setCurrentCurrency: (currency: Currency) => void;
};

export default function CurrencySwitch({
  currentCurrency,
  setCurrentCurrency,
}: CurrencySwitchProps) {
  const usdButtonRef = useRef<HTMLButtonElement | null>(null);
  const bsButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleCurrencyKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    targetCurrency: Currency
  ) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      usdButtonRef.current?.focus();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      bsButtonRef.current?.focus();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      setCurrentCurrency(targetCurrency);
    }
  };

  return (
    <div className="flex items-center w-full rounded-lg overflow-hidden">
      <Button
        ref={usdButtonRef}
        className={`w-1/2 ${
          currentCurrency === "USD"
            ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500"
            : ""
        } rounded-none rounded-l-lg border-r-0`}
        type="button"
        variant={currentCurrency === "USD" ? "default" : "outline"}
        onClick={() => setCurrentCurrency("USD")}
        onKeyDown={(event) => handleCurrencyKeyDown(event, "USD")}
      >
        USD
      </Button>

      <Button
        ref={bsButtonRef}
        className={`w-1/2 ${
          currentCurrency === "BS"
            ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500"
            : ""
        } rounded-none rounded-r-lg border-l-0`}
        type="button"
        variant={currentCurrency === "BS" ? "default" : "outline"}
        onClick={() => setCurrentCurrency("BS")}
        onKeyDown={(event) => handleCurrencyKeyDown(event, "BS")}
      >
        BS
      </Button>
    </div>
  );
}