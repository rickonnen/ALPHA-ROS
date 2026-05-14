"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CityCard } from "./CityCard";
import { CityCardSkeleton, EmptyCard } from "./CityCardStates";
import { ARR_TABS } from "./constants";
import type { CityData, OperationTab, OperationType } from "./types";

/**
 * @Dev: Rodrigo Chalco
 * @Dev: Maicol Ismael Nina Zarate
 * @Update: Refactorizado para usar variables globales Tailwind y soportar Modo Oscuro.
 */

interface CitySlotProps {
  bolLoading:   boolean;
  objCity:      CityData | undefined;
  strOperation: OperationType;
  bolIsLarge:   boolean;
  intRank:      number;
}

function CitySlot({
  bolLoading,
  objCity,
  strOperation,
  bolIsLarge,
  intRank,
}: CitySlotProps): React.ReactNode {
  if (bolLoading) return <CityCardSkeleton />;
  if (objCity)    return (
    <CityCard
      objCity={objCity}
      strOperation={strOperation}
      bolIsLarge={bolIsLarge}
      intRank={intRank}
    />
  );
  return <EmptyCard />;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TopCities(): React.ReactNode {
  const [strOperation,   setStrOperation]   = useState<OperationType>("venta");
  const [bolIsAnimating, setBolIsAnimating] = useState<boolean>(false);
  const [bolLoading,     setBolLoading]     = useState<boolean>(true);
  const [bolError,       setBolError]       = useState<boolean>(false);
  const [arrCities,      setArrCities]      = useState<CityData[]>([]);

  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const fetchCities = useCallback(async (strOp: OperationType) => {
    setBolLoading(true);
    setBolError(false);
    try {
      const objResponse = await fetch(`/api/home/top-cities?operacion=${strOp}`);
      if (!objResponse.ok) throw new Error("Error en la respuesta");
      const arrData: CityData[] = await objResponse.json();
      setArrCities(arrData);
    } catch {
      setBolError(true);
    } finally {
      setBolLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities(strOperation);
  }, [strOperation, fetchCities]);

  const changeOperation = useCallback(
    (strNewOp: OperationType): void => {
      if (bolIsAnimating || strNewOp === strOperation) return;
      setBolIsAnimating(true);
      animTimerRef.current = setTimeout(() => {
        setStrOperation(strNewOp);
        setBolIsAnimating(false);
      }, 260);
    },
    [bolIsAnimating, strOperation],
  );

  const slotProps = (index: number, bolIsLarge: boolean): CitySlotProps => ({
    bolLoading,
    objCity:     arrCities[index],
    strOperation,
    bolIsLarge,
    intRank:     index + 1,
  });

  return (
    <section
      className="w-full py-8 px-4 sm:px-6 md:px-8 lg:px-10 font-sans"
      aria-label="Ciudades más buscadas"
    >
      {/* ── Encabezado + tabs ── */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5 text-muted-foreground">
          Más buscados
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl text-foreground">
            ¿Dónde quieres vivir?
          </h2>

          <div
            className="flex items-center rounded-xl p-1 gap-1 self-start sm:self-auto bg-muted"
            role="tablist"
            aria-label="Tipo de oferta"
          >
            {ARR_TABS.map((objTab: OperationTab) => {
              const bolActive = objTab.strType === strOperation;
              return (
                <button
                  key={objTab.strType}
                  type="button"
                  role="tab"
                  aria-selected={bolActive}
                  onClick={() => changeOperation(objTab.strType)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      changeOperation(objTab.strType);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    bolActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                  }`}
                  aria-label={`Filtrar por ${objTab.strLabel}`}
                >
                  {objTab.strLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {bolError && (
        <div className="flex items-center justify-center rounded-2xl p-8 text-center bg-muted">
          <p className="text-muted-foreground">
            No se pudieron cargar las ciudades. Intenta de nuevo más tarde.
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {!bolError && (
        <div 
          className={`transition-opacity duration-[260ms] ease-in-out ${
            bolIsAnimating ? "opacity-0" : "opacity-100"
          }`}
        >

          {/* Mobile: 3 tarjetas apiladas */}
          <div className="flex flex-col gap-3 md:hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[200px]">
                <CitySlot {...slotProps(i, false)} />
              </div>
            ))}
          </div>

          {/* Desktop: grande izquierda + dos pequeñas derecha */}
          <div className="hidden md:flex gap-3 h-[480px]">
            <div className="flex-1">
              <CitySlot {...slotProps(0, true)} />
            </div>
            <div className="flex flex-col gap-3 w-[48%]">
              <div className="flex-1">
                <CitySlot {...slotProps(1, false)} />
              </div>
              <div className="flex-1">
                <CitySlot {...slotProps(2, false)} />
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}