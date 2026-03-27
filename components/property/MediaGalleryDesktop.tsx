/**
 * Dev: Marcela C.
 * Date: 25/03/2026
 * Funcionalidad: Grilla desktop con flechas y lightbox (HU4 - Tasks 4.4, 4.5, 4.11)
 * @param arrImagenesSafe - URLs de imágenes con fallback aplicado
 * @param strVideoId      - ID del video YouTube (opcional)
 * @param strReelId       - ID del Reel de Instagram (opcional)
 * @param intCurrentIndex - Índice actual del carrusel
 * @param strFallback     - URL imagen de empresa por defecto
 * @param onPrev          - Navegar imagen anterior
 * @param onNext          - Navegar imagen siguiente
 * @param onOpenLightbox  - Abrir lightbox en índice dado
 * @param onImgError      - Manejar error de imagen con fallback e índice
 */
import React from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface MediaGalleryDesktopProps {
  arrImagenesSafe: string[];
  strVideoId?:     string;
  strReelId?:      string;
  intCurrentIndex: number;
  strFallback:     string;
  onPrev:          () => void;
  onNext:          () => void;
  onOpenLightbox:  (intIdx: number) => void;
  onImgError:      (e: React.SyntheticEvent<HTMLImageElement>, intIdx?: number) => void;
}

export const MediaGalleryDesktop = ({
  arrImagenesSafe,
  strVideoId,
  strReelId,
  intCurrentIndex,
  strFallback,
  onPrev,
  onNext,
  onOpenLightbox,
  onImgError,
}: MediaGalleryDesktopProps) => (
  // Task 4.12: Solo visible en desktop
  <div className="hidden md:grid grid-cols-3 gap-4 h-125">

    {/* Task 4.4: Slot 1 — imagen principal con flechas y zoom */}
    <div className="col-span-2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={arrImagenesSafe[intCurrentIndex]}
        onError={(e) => onImgError(e, intCurrentIndex)}
        onClick={() => onOpenLightbox(intCurrentIndex)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        alt={`Vista ${intCurrentIndex + 1}`}
      />
      {/* Task 4.4: Ícono zoom al hover */}
      <div
        onClick={() => onOpenLightbox(intCurrentIndex)}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10"
      >
        <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
      </div>
      {/* Task 4.4: Flecha izquierda */}
      {intCurrentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition z-10"
        >
          <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
        </button>
      )}
      {/* Task 4.4: Flecha derecha */}
      {intCurrentIndex < arrImagenesSafe.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition z-10"
        >
          <ChevronRight className="w-5 h-5 text-[#2E2E2E]" />
        </button>
      )}
      {/* Task 4.4: Indicadores de posición */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {arrImagenesSafe.map((_, intIdx) => (
          <div
            key={intIdx}
            className={`w-2 h-2 rounded-full transition-all ${intIdx === intCurrentIndex ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>

    {/* Columna derecha */}
    <div className="flex flex-col gap-4">
      {/* Task 4.5: Slot 2 — YouTube, Instagram Reel, o imagen 2 */}
      <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-inner">
        {strVideoId ? (
          <iframe
            className="w-full h-full border-0"
            src={`https://www.youtube.com/embed/${strVideoId}`}
            title="Video del inmueble"
            allowFullScreen
          />
        ) : strReelId ? (
          <iframe
            className="w-full h-full border-0"
            src={`https://www.instagram.com/reel/${strReelId}/embed`}
            title="Reel del inmueble"
            allowFullScreen
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={arrImagenesSafe[1] || strFallback}
              onError={(e) => onImgError(e, 1)}
              onClick={() => onOpenLightbox(1)}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
              alt="Vista secundaria"
            />
          </>
        )}
      </div>
      {/* Task 4.4: Slot 3 — imagen 2 si hay video o reel, imagen 3 si no */}
      <div
        className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition"
        onClick={() => onOpenLightbox(strVideoId || strReelId ? 1 : 2)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={strVideoId || strReelId ? (arrImagenesSafe[1] || strFallback) : (arrImagenesSafe[2] || strFallback)}
          onError={(e) => onImgError(e, strVideoId || strReelId ? 1 : 2)}
          className="w-full h-full object-cover"
          alt="Vista adicional"
        />
      </div>
    </div>
  </div>
);