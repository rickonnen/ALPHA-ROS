"use client";

import { useState, useRef, useEffect } from "react";
import { Banknote as ObjBanknote, TrendingUp as ObjTrendingUp } from "lucide-react";
import Image from "next/image";
import { useDollarRate } from "@/components/hooks/getDollarRate";

export default function exchangeRateBubble() {
  const [bolIsOpen, setBolIsOpen] = useState(false);
  const { 
    compra: intCompra, 
    venta: intVenta, 
    loading: bolIsLoading, 
    error: strError, 
    lastUpdate: strLastUpdate 
  } = useDollarRate();
  
  const objContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fnHandleClickOutside = (objEvent: MouseEvent) => {
      if (objContainerRef.current && !objContainerRef.current.contains(objEvent.target as Node)) {
        setBolIsOpen(false);
      }
    };
    if (bolIsOpen) document.addEventListener("mousedown", fnHandleClickOutside);
    return () => document.removeEventListener("mousedown", fnHandleClickOutside);
  }, [bolIsOpen]);

  const fnFormatDate = (strDate: string | null) => {
    if (!strDate) return null;
    try {
      return new Date(strDate).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return strDate;
    }
  };

  return (
    <div ref={objContainerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Tarjeta emergente */}
      {bolIsOpen && (
        <div className="
          w-64 rounded-2xl overflow-hidden
          border border-border
          shadow-xl shadow-neutral-900/15
          bg-background
          animate-in fade-in slide-in-from-bottom-2 duration-200
        ">
          {/* Cabecera */}
          <div className="flex items-center justify-between px-4 py-3 bg-card-bg border-b border-border">
            <div className="flex items-center gap-2">
              <Image
                src="/banderaUSA.svg"
                alt="USA"
                width={20}
                height={14}
                className="rounded-sm object-cover"
              />
              <ObjTrendingUp size={13} className="text-secondary" />
              <Image
                src="/banderaBolivia.svg"
                alt="Bolivia"
                width={20}
                height={14}
                className="rounded-sm object-cover"
              />
              <span className="text-xs font-semibold tracking-widest text-primary uppercase ml-1">
                Paralelo
              </span>
            </div>
            <button
              onClick={() => setBolIsOpen(false)}
              className="text-foreground/40 hover:text-foreground/70 transition-colors text-lg leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo */}
          <div className="px-4 py-4">
            {bolIsLoading && (
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded bg-secondary-fund animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-secondary-fund animate-pulse" />
              </div>
            )}

            {strError && !bolIsLoading && (
              <p className="text-xs text-red-500 text-center py-1">⚠️ {strError}</p>
            )}

            {!bolIsLoading && !strError && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60 font-medium">Compra</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-foreground/40">Bs.</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {intCompra !== null ? intCompra.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60 font-medium">Venta</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-foreground/40">Bs.</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {intVenta !== null ? intVenta.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>

                <div className="my-1 border-t border-dashed border-border" />
                <p className="text-center text-[11px] text-foreground/40">
                  1.00 USD = Bs.{" "}
                  <span className="font-semibold text-primary">
                    {intVenta !== null ? intVenta.toFixed(2) : "—"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-card-bg border-t border-border">
            <p className="text-[10px] text-foreground/40 text-center">
              Fuente: DolarAPI · Bolivia
              {strLastUpdate && <span className="block">{fnFormatDate(strLastUpdate)}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Botón burbuja — azul petróleo */}
      <button
        onClick={() => setBolIsOpen((bolPrev) => !bolPrev)}
        className="
          group
          flex items-center justify-center
          w-14 h-14
          rounded-full
          bg-primary text-primary-foreground
          shadow-lg shadow-primary/40
          hover:brightness-90 hover:scale-110
          active:scale-95
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        "
        aria-label="Ver tipo de cambio USD / BOB"
      >
        <ObjBanknote
          size={26}
          className="group-hover:rotate-12 transition-transform duration-200"
        />
      </button>
    </div>
  );
}