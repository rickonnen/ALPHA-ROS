"use client";

import { useState, useRef, useEffect } from "react";
import { Banknote, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useDollarRate } from "@/components/hooks/getDollarRate";

export default function ExchangeRateBubble() {
  const [open, setOpen] = useState(false);
  const { compra, venta, loading, error, lastUpdate } = useDollarRate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Tarjeta emergente */}
      {open && (
        <div className="
          w-64 rounded-2xl overflow-hidden
          border border-[#E7E1D7]
          shadow-xl shadow-neutral-900/15
          bg-[#F4EFE6]
          animate-in fade-in slide-in-from-bottom-2 duration-200
        ">
          {/* Cabecera */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E7E1D7]">
            <div className="flex items-center gap-2">
              <Image
                src="/banderaUSA.svg"
                alt="USA"
                width={20}
                height={14}
                className="rounded-sm object-cover"
              />
              <TrendingUp size={13} className="text-[#C26E5A]" />
              <Image
                src="/banderaBolivia.svg"
                alt="Bolivia"
                width={20}
                height={14}
                className="rounded-sm object-cover"
              />
              <span className="text-xs font-semibold tracking-widest text-[#1F3A4D] uppercase ml-1">
                Paralelo
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[#2E2E2E]/40 hover:text-[#2E2E2E]/70 transition-colors text-lg leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo */}
          <div className="px-4 py-4">
            {loading && (
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded bg-[#E7E1D7] animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-[#E7E1D7] animate-pulse" />
              </div>
            )}

            {error && !loading && (
              <p className="text-xs text-red-500 text-center py-1">⚠️ {error}</p>
            )}

            {!loading && !error && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#2E2E2E]/60 font-medium">Compra</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-[#2E2E2E]/40">Bs.</span>
                    <span className="text-lg font-bold text-[#2E2E2E] tabular-nums">
                      {compra !== null ? compra.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#2E2E2E]/60 font-medium">Venta</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-[#2E2E2E]/40">Bs.</span>
                    <span className="text-lg font-bold text-[#2E2E2E] tabular-nums">
                      {venta !== null ? venta.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>

                <div className="my-1 border-t border-dashed border-[#E7E1D7]" />
                <p className="text-center text-[11px] text-[#2E2E2E]/40">
                  1.00 USD = Bs.{" "}
                  <span className="font-semibold text-[#1F3A4D]">
                    {venta !== null ? venta.toFixed(2) : "—"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-white border-t border-[#E7E1D7]">
            <p className="text-[10px] text-[#2E2E2E]/40 text-center">
              Fuente: DolarAPI · Bolivia
              {lastUpdate && <span className="block">{formatDate(lastUpdate)}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Botón burbuja — azul petróleo */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          group
          flex items-center justify-center
          w-14 h-14
          rounded-full
          bg-[#1F3A4D] text-white
          shadow-lg shadow-[#1F3A4D]/40
          hover:bg-[#16303f] hover:scale-110
          active:scale-95
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2
        "
        aria-label="Ver tipo de cambio USD / BOB"
      >
        <Banknote
          size={26}
          className="group-hover:rotate-12 transition-transform duration-200"
        />
      </button>
    </div>
  );
}