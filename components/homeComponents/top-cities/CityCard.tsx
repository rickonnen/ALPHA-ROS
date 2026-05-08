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
        "shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-[transform,box-shadow] duration-300",
        bolSinDisponibles
          ? "cursor-default"
          : "cursor-pointer hover:scale-[1.018] hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]",
      ].join(" ")}
    >
      {/* ── Fotos con crossfade ── */}
      <div className="absolute inset-0 bg-gray-800">
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* ── Badge operación ── */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
        >
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
              className="flex h-6 w-6 items-center justify-center rounded-full text-white text-lg leading-none"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
              aria-label={`${dir === "prev" ? "Imagen anterior" : "Siguiente imagen"} de ${objCity.strDepartamento}`}
            >
              {dir === "prev" ? "‹" : "›"}
            </button>
          ))}
        </div>
      )}

      {/* ── Contenido inferior ── */}
      <div className="absolute bottom-[-8px] left-0 right-0 p-4 sm:p-5 z-10">
        <h3
          className="font-sans font-bold leading-none text-white"
          style={{
            fontSize:   bolIsLarge ? "clamp(1.6rem, 2.5vw, 2.2rem)" : "clamp(1.05rem, 1.8vw, 1.35rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {objCity.strDepartamento}
        </h3>

        {objCity.strDescription && (
            <p
            className="font-sans mt-2 leading-snug"
            style={{
            fontSize:   bolIsLarge ? "0.95rem" : "0.78rem",
            fontWeight: 500,
            color:      "rgba(255,255,255,0.82)",
            maxWidth:   "85%",
          }}
    >
      {objCity.strDescription}
      </p>
      )}

        {/* ── Dots + botón ── */}
        <div className="mt-0 flex items-center justify-between">
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
                style={{
                  height:       "5px",
                  width:        intIndex === intCurrentIndex ? "18px" : "5px",
                  background:   intIndex === intCurrentIndex
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.3)",
                  transition:   "width 0.5s ease",
                  border:       "none",
                  borderRadius: "9999px",
                  cursor:       "pointer",
                  display:      "block",
                  padding:      0,
                }}
              />
            ))}
          </div>

          {bolSinDisponibles ? (
            <span
              className="font-sans text-[10px] font-semibold rounded-full px-2 py-1"
              style={{
                background: "rgba(255,255,255,0.15)",
                color:      "rgba(255,255,255,0.6)",
              }}
            >
              0 disponibles
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              className="flex items-center justify-center rounded-full transition-[background] duration-200 hover:bg-white/30"
              style={{
                height:         "32px",
                width:          "32px",
                background:     "rgba(255,255,255,0.16)",
                border:         "1px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(8px)",
                color:          "white",
              }}
              aria-label={`Ver propiedades en ${objCity.strDepartamento}`}
            >
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}