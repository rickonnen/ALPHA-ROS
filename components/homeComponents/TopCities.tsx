"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCarousel } from "../hooks/useCarousel";

/**
 * @Dev: Rodrigo Chalco
 * @Dev: Maicol Ismael Nina Zarate
 * Funcionalidad: Sección "¿Dónde quieres vivir?" en el Home.
 * Cumple todos los criterios de aceptación del user story.
 * Usa variables de globals.css y fuente Geist (font-sans).
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

type OperationType = "venta" | "alquiler" | "anticretico";

interface CityImageData {
  strUrl: string;
  strAlt: string;
  strPublicId: string;
}

interface CityData {
  strDepartamento: string;
  intContador: number;
  arrImagenes: CityImageData[];
}

interface OperationTab {
  strType: OperationType;
  strLabel: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const ARR_TABS: OperationTab[] = [
  { strType: "venta", strLabel: "En Venta" },
  { strType: "alquiler", strLabel: "Alquiler" },
  { strType: "anticretico", strLabel: "Anticrético" },
];

// ─── Subcomponente: tarjeta de ciudad ─────────────────────────────────────────

interface CityCardProps {
  objCity: CityData;
  strOperation: OperationType;
  strOperationLabel: string;
  bolIsLarge: boolean;
  intRank: number;
}

function CityCard({
  objCity,
  strOperation,
  strOperationLabel,
  bolIsLarge,
  intRank,
}: CityCardProps): React.ReactNode {
  const objRouter = useRouter();
  const {
    intCurrentIndex: intImageIndex,
    goToNextImage,
    goToPreviousImage,
    goToSelectedImage,
    touchHandlers,
  } = useCarousel({
    intTotalItems: objCity.arrImagenes.length,
    intAutoPlayDelay: 7000,
  });

  const handleCardClick = (): void => {
    if (objCity.intContador === 0) return;

    const objParams = new URLSearchParams();
    objParams.set("ciudad", objCity.strDepartamento.trim());
    objParams.set("operaciones", strOperation);

    objRouter.push(`/busqueda?${objParams.toString()}`);
  };

  const handleArrowClick = (
    e: React.MouseEvent,
    strDirection: "prev" | "next",
  ): void => {
    e.stopPropagation();
    if (strDirection === "next") goToNextImage();
    else goToPreviousImage();
  };

  const handleDotClick = (e: React.MouseEvent, intIndex: number): void => {
    e.stopPropagation();
    goToSelectedImage(intIndex);
  };

  const bolSinDisponibles = objCity.intContador === 0;

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver propiedades en ${objCity.strDepartamento} - ${strOperationLabel}`}
      {...touchHandlers}
      className="group relative h-full w-full overflow-hidden rounded-2xl select-none font-sans"
      style={{
        cursor: bolSinDisponibles ? "default" : "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
      onMouseEnter={(e) => {
        if (bolSinDisponibles) return;
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.018)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 16px 40px rgba(0,0,0,0.22)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.10)";
      }}
    >
      {/* Fotos con crossfade */}
      <div className="absolute inset-0 bg-gray-800">
        {objCity.arrImagenes.map((objImage: CityImageData, intIndex: number) => (
          <img
            key={objImage.strPublicId}
            src={objImage.strUrl}
            alt={`${objCity.strDepartamento} - ${objImage.strAlt}`}
            title={`${objCity.strDepartamento}`}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{
              opacity: intIndex === intImageIndex ? 1 : 0,
              transition: "opacity 1.4s ease",
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Gradiente */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* Badge operación arriba izquierda */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
        >
          {strOperationLabel}
        </span>
      </div>

      {/* Flechas del carrusel arriba derecha */}
      {objCity.arrImagenes.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => handleArrowClick(e, "prev")}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white text-lg leading-none font-sans"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            aria-label={`Imagen anterior de ${objCity.strDepartamento}`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => handleArrowClick(e, "next")}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white text-lg leading-none font-sans"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            aria-label={`Siguiente imagen de ${objCity.strDepartamento}`}
          >
            ›
          </button>
        </div>
      )}

      {/* Contenido inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
        {/* Nombre ciudad */}
        <h3
          className="font-sans font-bold leading-none text-white"
          style={{
            fontSize: bolIsLarge
              ? "clamp(1.6rem, 2.5vw, 2.2rem)"
              : "clamp(1.05rem, 1.8vw, 1.35rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {objCity.strDepartamento}
        </h3>

        {/* Descripción */}
        <p
          className="font-sans mt-1 leading-snug"
          style={{
            fontSize: bolIsLarge ? "0.875rem" : "0.72rem",
            color: "rgba(255,255,255,0.72)",
            maxWidth: "80%",
          }}
        >
          {strOperationLabel} · #{intRank} más buscado
        </p>

        {/* Fila: dots + botón */}
        <div className="mt-3 flex items-center justify-between">
          {/* Dots */}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {objCity.arrImagenes.map((_: CityImageData, intIndex: number) => (
              <button
                key={intIndex}
                type="button"
                onClick={(e) => handleDotClick(e, intIndex)}
                aria-label={`Ir a imagen ${intIndex + 1} de ${objCity.strDepartamento}`}
                style={{
                  height: "5px",
                  width: intIndex === intImageIndex ? "18px" : "5px",
                  background:
                    intIndex === intImageIndex
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.3)",
                  transition: "width 0.5s ease",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  display: "block",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Botón o badge sin disponibles */}
          {bolSinDisponibles ? (
            <span
              className="font-sans text-[10px] font-semibold rounded-full px-2 py-1"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              0 disponibles
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="flex items-center justify-center rounded-full"
              style={{
                height: "32px",
                width: "32px",
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(8px)",
                color: "white",
                transition: "background 0.2s",
              }}
              aria-label={`Ver propiedades en ${objCity.strDepartamento}`}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.30)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.16)")
              }
            >
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CityCardSkeleton(): React.ReactNode {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl animate-pulse bg-muted" />
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyCard(): React.ReactNode {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl flex items-center justify-center bg-muted">
      <p className="font-sans text-sm font-medium text-center px-4 text-muted-foreground">
        Aún no existentes
      </p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TopCities(): React.ReactNode {
  const [strOperation, setStrOperation] = useState<OperationType>("venta");
  const [bolIsAnimating, setBolIsAnimating] = useState<boolean>(false);
  const [bolLoading, setBolLoading] = useState<boolean>(true);
  const [bolError, setBolError] = useState<boolean>(false);
  const [arrCities, setArrCities] = useState<CityData[]>([]);

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
      setTimeout(() => {
        setStrOperation(strNewOp);
        setBolIsAnimating(false);
      }, 260);
    },
    [bolIsAnimating, strOperation],
  );

  const strCurrentLabel =
    ARR_TABS.find((t) => t.strType === strOperation)?.strLabel ?? "";

  return (
    <section
      className="w-full py-8 px-4 sm:px-6 md:px-8 lg:px-10 font-sans"
      aria-label="Ciudades más buscadas"
    >
      {/* ── Encabezado + tabs ── */}
      <div className="mb-6">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-widest mb-0.5 text-muted-foreground">
          Más buscados
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="font-sans text-2xl font-bold sm:text-3xl text-foreground">
            ¿Dónde quieres vivir?
          </h2>

          {/* Tabs de operación */}
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
                  className="font-sans rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  style={{
                    background: bolActive ? "var(--primary)" : "transparent",
                    color: bolActive
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                    boxShadow: bolActive ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                  }}
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
          <p className="font-sans text-sm text-muted-foreground">
            No se pudieron cargar las ciudades. Intenta de nuevo más tarde.
          </p>
        </div>
      )}

      {/* ── Grid de ciudades ── */}
      {!bolError && (
        <div
          style={{
            opacity: bolIsAnimating ? 0 : 1,
            transition: "opacity 0.26s ease",
          }}
        >
          {/* Mobile: las 3 tarjetas iguales apiladas */}
          <div className="flex flex-col gap-3 md:hidden">
            {[0, 1, 2].map((intI) => (
              <div key={intI} style={{ height: "200px" }}>
                {bolLoading ? (
                  <CityCardSkeleton />
                ) : arrCities[intI] ? (
                  <CityCard
                    objCity={arrCities[intI]}
                    strOperation={strOperation}
                    strOperationLabel={strCurrentLabel}
                    bolIsLarge={false}
                    intRank={intI + 1}
                  />
                ) : (
                  <EmptyCard />
                )}
              </div>
            ))}
          </div>

          {/* Desktop: grande izquierda + dos pequeñas derecha */}
          <div className="hidden md:flex gap-3" style={{ height: "480px" }}>
            <div className="flex-1">
              {bolLoading ? (
                <CityCardSkeleton />
              ) : arrCities[0] ? (
                <CityCard
                  objCity={arrCities[0]}
                  strOperation={strOperation}
                  strOperationLabel={strCurrentLabel}
                  bolIsLarge={true}
                  intRank={1}
                />
              ) : (
                <EmptyCard />
              )}
            </div>

            <div className="flex flex-col gap-3" style={{ width: "48%" }}>
              <div className="flex-1">
                {bolLoading ? (
                  <CityCardSkeleton />
                ) : arrCities[1] ? (
                  <CityCard
                    objCity={arrCities[1]}
                    strOperation={strOperation}
                    strOperationLabel={strCurrentLabel}
                    bolIsLarge={false}
                    intRank={2}
                  />
                ) : (
                  <EmptyCard />
                )}
              </div>
              <div className="flex-1">
                {bolLoading ? (
                  <CityCardSkeleton />
                ) : arrCities[2] ? (
                  <CityCard
                    objCity={arrCities[2]}
                    strOperation={strOperation}
                    strOperationLabel={strCurrentLabel}
                    bolIsLarge={false}
                    intRank={3}
                  />
                ) : (
                  <EmptyCard />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}