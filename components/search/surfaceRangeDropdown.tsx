"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurfaceRangeDropdownProps {
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onClear?: () => void;
}

export default function SurfaceRangeDropdown({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  onClear,
}: SurfaceRangeDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [surfaceError, setSurfaceError] = React.useState<string | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const maxInputRef = React.useRef<HTMLInputElement | null>(null);

  const sanitizeZeroLikeValue = (value: string) => {
    if (value.trim() === "") return "";
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed <= 0) return "";
    return value;
  };

  const normalizedMinValue = sanitizeZeroLikeValue(minValue);
  const normalizedMaxValue = sanitizeZeroLikeValue(maxValue);

  const hasValue = Boolean(normalizedMinValue || normalizedMaxValue);

  const label = React.useMemo(() => {
    if (normalizedMinValue && normalizedMaxValue) {
      return `${normalizedMinValue}m² - ${normalizedMaxValue}m²`;
    }
    if (normalizedMinValue) return `Desde ${normalizedMinValue}m²`;
    if (normalizedMaxValue) return `Hasta ${normalizedMaxValue}m²`;
    return "Superficie m²";
  }, [normalizedMinValue, normalizedMaxValue]);

  const applySurfaceRange = (nextMin: string, nextMax: string) => {
    const safeMin = sanitizeZeroLikeValue(nextMin);
    const safeMax = sanitizeZeroLikeValue(nextMax);

    if (safeMin !== nextMin) onMinChange(safeMin);
    if (safeMax !== nextMax) onMaxChange(safeMax);

    const parsedMin = safeMin === "" ? undefined : Number(safeMin);
    const parsedMax = safeMax === "" ? undefined : Number(safeMax);

    if (parsedMin !== undefined && Number.isNaN(parsedMin)) {
      setSurfaceError("Solo se permiten números");
      return false;
    }

    if (parsedMax !== undefined && Number.isNaN(parsedMax)) {
      setSurfaceError("Solo se permiten números");
      return false;
    }

    if (
      parsedMin !== undefined &&
      parsedMax !== undefined &&
      parsedMin > parsedMax
    ) {
      setSurfaceError("Superficie mínima no puede ser mayor a superficie máxima");
      return false;
    }

    setSurfaceError(null);
    return true;
  };

  const handleSurfaceChange =
    (field: "min" | "max") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();

      if (value === "") {
        if (field === "min") onMinChange("");
        else onMaxChange("");

        setSurfaceError(null);
        return;
      }

      const validSurface = /^\d*\.?\d*$/.test(value);

      if (!validSurface) {
        setSurfaceError("Solo se permiten números");
        return;
      }

      setSurfaceError(null);

      if (field === "min") onMinChange(value);
      else onMaxChange(value);
    };

  const handleMinKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const success = applySurfaceRange(minValue, maxValue);

      if (success) {
        maxInputRef.current?.focus();
      }
    }
  };

  const handleMaxKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const success = applySurfaceRange(minValue, maxValue);

      if (success) {
        setOpen(false);

        setTimeout(() => {
          triggerRef.current?.focus();
        }, 30);
      }
    }
  };

  return (
    <div className="space-y-2 overflow-hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] shadow-sm transition"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate">{label}</span>

          {hasValue && onClear && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSurfaceError(null);
                onClear();
              }}
              className="p-1 rounded-full hover:bg-[#DEDAD3] transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="h-4 w-4 text-[#5E5A55]" />

            </span>
          )}
        </div>

        <span
          className="text-[#4B4B4B] transition-transform duration-200"
          style={{
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-150",
          open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-xl border border-[#B9B1A5] bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Min m²"
              value={minValue}
              onChange={handleSurfaceChange("min")}
              onKeyDown={handleMinKeyDown}
              className={cn(
                "w-full rounded-lg border bg-[#F3F1EC] px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6B6B6B]",
                surfaceError ? "border-red-500" : "border-[#8F8679]"
              )}
            />

            <input
              ref={maxInputRef}
              type="text"
              inputMode="decimal"
              placeholder="Max m²"
              value={maxValue}
              onChange={handleSurfaceChange("max")}
              onKeyDown={handleMaxKeyDown}
              className={cn(
                "w-full rounded-lg border bg-[#F3F1EC] px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6B6B6B]",
                surfaceError ? "border-red-500" : "border-[#8F8679]"
              )}
            />
          </div>

          <div className={surfaceError ? "mt-2 block" : "hidden"}>
            <p className="text-center text-sm text-red-600">{surfaceError}</p>
          </div>
        </div>
      </div>
    </div>
  );
}