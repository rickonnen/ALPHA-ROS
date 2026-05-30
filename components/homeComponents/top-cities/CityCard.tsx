"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCarousel } from "../../hooks/useCarousel";
import { OPERATION_LABEL, INT_CITY_IMAGE_DELAY } from "./constants";
import type { CityData, OperationType } from "./types";

/**
 * @Dev: Rodrigo Chalco
 */

interface CityCardProps {
  objCity:      CityData;
  strOperation: OperationType;
  bolIsLarge:   boolean;
  intRank:      number;
}

export function CityCard({
  objCity,
  strOperation,
  bolIsLarge,
  intRank,
}: CityCardProps): React.ReactNode {
  const objRouter         = useRouter();
  const strOperationLabel = OPERATION_LABEL[strOperation];
  const bolSinDisponibles = objCity.intContador === 0;

  const {
    intCurrentIndex,
    containerRef,
    goToNextImage,
    goToPreviousImage,
    goToSelectedImage,
    touchHandlers,
  } = useCarousel({
    intTotalItems:    objCity.arrImagenes.length,
    intAutoPlayDelay: INT_CITY_IMAGE_DELAY,
  });

  const handleCardClick = (): void => {
    if (bolSinDisponibles) return;
    const params = new URLSearchParams({
      ciudad:      objCity.strDepartamento.trim(),
      operaciones: strOperation,
    });
    objRouter.push(`/busqueda?${params.toString()}`);
  };

  const handleArrowClick = (
    e: React.MouseEvent,
    direction: "prev" | "next",
  ): void => {
    e.stopPropagation();
    direction === "next" ? goToNextImage() : goToPreviousImage();
  };

  const handleDotClick = (e: React.MouseEvent, index: number): void => {
    e.stopPropagation();
    goToSelectedImage(index);
  };

  return (
    <div
      ref={containerRef}
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
      className={[
        "group relative h-full w-full overflow-hidden rounded-2xl select-none font-sans",
        "bg-card-bg border border-card-border shadow-sm transition-all duration-300",
        bolSinDisponibles
          ? "cursor-default opacity-80 grayscale-[30%]"
          : "cursor-pointer hover:scale-[1.018] hover:shadow-xl hover:border-primary/30",
      ].join(" ")}
    >
      {/* ── Fotos con crossfade ── */}
      <div className="absolute inset-0 bg-secondary">
        {objCity.arrImagenes.map((objImage, intIndex) => (
          <Image
            key={objImage.strPublicId}
            src={objImage.strUrl}
            alt={`${objCity.strDepartamento} - ${objImage.strAlt}`}
            title={objCity.strDepartamento}
            fill
            className="object-cover object-center"
            style={{
              opacity:    intIndex === intCurrentIndex ? 1 : 0,
              transition: "opacity 1.4s ease",
            }}
            draggable={false}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder-city.jpg";
            }}
          />
        ))}
      </div>

      {/* ── Gradiente inferior ── */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* ── Badge operación ── */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white drop-shadow-md">
          {strOperationLabel}
        </span>
      </div>

      {/* ── Flechas carrusel ── */}
      {objCity.arrImagenes.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          {(["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={(e) => handleArrowClick(e, dir)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white bg-black/30 backdrop-blur-md hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label={`${dir === "prev" ? "Imagen anterior" : "Siguiente imagen"} de ${objCity.strDepartamento}`}
            >
              <span className="text-lg leading-none -mt-0.5">{dir === "prev" ? "‹" : "›"}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Contenido inferior ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
        <h3
          className="font-bold leading-none text-white drop-shadow-lg"
          style={{
            fontSize: bolIsLarge ? "clamp(1.6rem, 2.5vw, 2.2rem)" : "clamp(1.05rem, 1.8vw, 1.35rem)",
          }}
        >
          {objCity.strDepartamento}
        </h3>

        {objCity.strDescription && (
          <p
            className="mt-2 leading-snug font-medium text-white/90 drop-shadow-md"
            style={{
              fontSize: bolIsLarge ? "0.95rem" : "0.78rem",
              maxWidth: "85%",
            }}
          >
            {objCity.strDescription}
          </p>
        )}

        {/* ── Dots + botón ── */}
        <div className="mt-3 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {objCity.arrImagenes.map((_, intIndex) => (
              <button
                key={intIndex}
                type="button"
                onClick={(e) => handleDotClick(e, intIndex)}
                aria-label={`Ir a imagen ${intIndex + 1} de ${objCity.strDepartamento}`}
                className={`h-[5px] rounded-full transition-all duration-500 ${
                  intIndex === intCurrentIndex
                    ? "w-[18px] bg-primary"
                    : "w-[5px] bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          {bolSinDisponibles ? (
            <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white/80 border border-white/10">
              0 disponibles
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110 shadow-lg"
              aria-label={`Ver propiedades en ${objCity.strDepartamento}`}
            >
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}