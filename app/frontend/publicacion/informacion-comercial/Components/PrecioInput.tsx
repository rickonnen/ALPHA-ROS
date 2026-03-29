"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PrecioInputProps {
  value:     string;
  hasError:  boolean;
  errorMsg?: string;
  onChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur:    (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function PrecioInput({
  value, hasError, errorMsg, onChange, onBlur,
}: PrecioInputProps) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full sm:w-[110px] flex-1 sm:flex-initial">
      <Label htmlFor="precio" className="text-[0.82rem] font-medium text-[#1A1714]">
        Precio
      </Label>
      <Input
        id="precio"
        name="precio"
        type="text"
        inputMode="decimal"
        placeholder="0,00 Bs."
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="off"
        className={`h-10 text-[0.88rem] text-[#1A1714] ${
          hasError
            ? "border-[#C0503A] focus-visible:ring-0"
            : "border-[#D4CFC6] focus-visible:ring-0"
        }`}
      />
      {hasError && errorMsg && (
        <span className="text-[0.74rem] text-[#C0503A] leading-snug">{errorMsg}</span>
      )}
    </div>
  );
}