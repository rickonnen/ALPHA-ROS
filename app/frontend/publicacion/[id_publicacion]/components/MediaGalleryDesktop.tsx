/**
 * Dev: Gustavo Montaño
 * Date: 26/03/2026
 * Funcionalidad: Grilla desktop con flechas y lightbox (HU4 - Tasks 4.4, 4.5, 4.11)
 * @param arrImagenesSafe - URLs de imágenes con fallback aplicado
 * @param strVideoId      - ID del video YouTube (opcional)
 * @param strReelId       - ID del Reel de Instagram (opcional)
 * @param intCurrentIndex - Índice actual del carrusel principal
 * @param strFallback     - URL de imagen de empresa por defecto
 * @param onPrev          - Función para navegar a la imagen anterior
 * @param onNext          - Función para navegar a la imagen siguiente
 * @param onOpenLightbox  - Función para abrir el lightbox en un índice dado
 * @param onImgError      - Función para manejar error de imagen con fallback
 * @return JSX con grilla de 3 columnas visible solo en desktop
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
    {/* Columna derecha: Slots 2 y 3 */}
    <div className="flex flex-col gap-4">
      {/* Slot 2: Video o Imagen 2 */}
      <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-inner relative">
        {strVideoId ? (
          <iframe className="w-full h-full border-0" src={`https://www.youtube.com/embed/${strVideoId}`} title="Video" allowFullScreen />
        ) : strReelId ? (
          <iframe className="w-full h-full border-0" src={`https://www.instagram.com/reel/${strReelId}/embed`} title="Reel" allowFullScreen />
        ) : (
          <img
            src={arrImagenesSafe.length > 1 ? arrImagenesSafe[(intCurrentIndex + 1) % arrImagenesSafe.length] : strFallback}
            onError={(e) => onImgError(e)}
            onClick={() => arrImagenesSafe.length > 1 && onOpenLightbox((intCurrentIndex + 1) % arrImagenesSafe.length)}
            className={`w-full h-full object-cover transition ${arrImagenesSafe.length > 1 ? "cursor-pointer hover:opacity-90" : ""}`}
            alt="Vista secundaria"
          />
        )}
      </div>

      {/* Slot 3: Imagen 2 (si hay video) o Imagen 3 (si no hay video) */}
      <div
        className={`h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm transition ${
          ((strVideoId || strReelId) && arrImagenesSafe.length > 1) || (!strVideoId && !strReelId && arrImagenesSafe.length > 2) ? "cursor-pointer hover:opacity-90" : ""
        }`}
        onClick={() => {
          if ((strVideoId || strReelId) && arrImagenesSafe.length > 1) onOpenLightbox(1);
          else if (!strVideoId && !strReelId && arrImagenesSafe.length > 2) onOpenLightbox(2);
        }}
      >
        <img
          src={
            strVideoId || strReelId
              ? (arrImagenesSafe.length > 1 ? arrImagenesSafe[(intCurrentIndex + 1) % arrImagenesSafe.length] : strFallback)
              : (arrImagenesSafe.length > 2 ? arrImagenesSafe[(intCurrentIndex + 2) % arrImagenesSafe.length] : strFallback)
          }
          onError={(e) => onImgError(e)}
          className="w-full h-full object-cover"
          alt="Vista adicional"
        />
      </div>
    </div>
  </div>
);