"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
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

  const hasValue = Boolean(minValue || maxValue);

  const label = React.useMemo(() => {
    if (minValue && maxValue) return `${minValue}m² - ${maxValue}m²`;
    if (minValue) return `Desde ${minValue}m²`;
    if (maxValue) return `Hasta ${maxValue}m²`;
    return "Superficie m²";
  }, [minValue, maxValue]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-[#B9B1A5] bg-[#E7E3DD] px-4 py-3 text-sm text-[#2E2E2E] shadow-sm transition"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate">{label}</span>

          {hasValue && onClear && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="inline-flex h-4 w-4 items-center justify-center text-[#4A4A4A] hover:text-black"
            >
              <X className="h-4 w-4" />
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#2E2E2E] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="rounded-xl border border-[#B9B1A5] bg-[#E7E3DD] p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min m²"
              value={minValue}
              onChange={(e) => onMinChange(e.target.value)}
              className="w-full rounded-lg border border-[#8F8679] bg-[#F3F1EC] px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6B6B6B]"
            />

            <input
              type="number"
              min="0"
              placeholder="Max m²"
              value={maxValue}
              onChange={(e) => onMaxChange(e.target.value)}
              className="w-full rounded-lg border border-[#8F8679] bg-[#F3F1EC] px-3 py-2 text-sm text-[#2E2E2E] outline-none placeholder:text-[#6B6B6B]"
            />
          </div>
        </div>
      )}
    </div>
  );
}