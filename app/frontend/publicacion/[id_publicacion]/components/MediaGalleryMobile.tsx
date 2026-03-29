/**
 * Dev: Marcela C.
 * Date: 26/03/2026
 * Funcionalidad: Carrusel mobile con flechas e indicadores (HU4 - Tasks 4.4, 4.12)
 * @param arrImagenesSafe - URLs de imágenes con fallback aplicado
 * @param strVideoId      - ID del video YouTube (opcional)
 * @param strReelId       - ID del Reel de Instagram (opcional)
 * @param intCurrentIndex - Índice actual del carrusel
 * @param intTotalSlides  - Total de slides incluyendo video si existe
 * @param onPrev          - Función para navegar a la imagen anterior
 * @param onNext          - Función para navegar a la imagen siguiente
 * @param onOpenLightbox  - Función para abrir el lightbox en un índice dado
 * @param onImgError      - Función para manejar error de imagen con fallback
 * @return JSX con carrusel de una columna visible solo en mobile
 */
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
interface MediaGalleryMobileProps {
  arrImagenesSafe: string[];
  strVideoId?:     string;
  strReelId?:      string;
  intCurrentIndex: number;
  intTotalSlides:  number;
  onPrev:          () => void;
  onNext:          () => void;
  onOpenLightbox:  (intIdx: number) => void;
  onImgError:      (e: React.SyntheticEvent<HTMLImageElement>, intIdx?: number) => void;
}
export const MediaGalleryMobile = ({
  arrImagenesSafe,
  strVideoId,
  strReelId,
  intCurrentIndex,
  intTotalSlides,
  onPrev,
  onNext,
  onOpenLightbox,
  onImgError,
}: MediaGalleryMobileProps) => {
  // Task 4.5: El video o reel ocupa el último slide del carrusel
  const bolEsSlideVideo = (strVideoId || strReelId) && intCurrentIndex === arrImagenesSafe.length;
  return (
    // Task 4.12: Solo visible en mobile
    <div className="md:hidden relative h-70 bg-[#E7E1D7] rounded-2xl overflow-hidden">
      {/* Task 4.5: Último slide = YouTube, Instagram Reel, o imagen */}
      {bolEsSlideVideo ? (
        strVideoId ? (
          <iframe
            className="w-full h-full border-0"
            src={`https://www.youtube.com/embed/${strVideoId}`}
            title="Video del inmueble"
            allowFullScreen
          />
        ) : (
          <iframe
            className="w-full h-full border-0"
            src={`https://www.instagram.com/reel/${strReelId}/embed`}
            title="Reel del inmueble"
            allowFullScreen
          />
        )
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={arrImagenesSafe[intCurrentIndex]}
            onError={(e) => onImgError(e, intCurrentIndex)}
            onClick={() => onOpenLightbox(intCurrentIndex)}
            className="w-full h-full object-cover cursor-pointer"
            alt={`Imagen ${intCurrentIndex + 1}`}
          />
        </>
      )}
      {/* Task 4.4: Flecha izquierda */}
      {intCurrentIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow z-10"
        >
          <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
        </button>
      )}
      {/* Task 4.4: Flecha derecha — navega hasta slide de video o reel */}
      {intCurrentIndex < intTotalSlides - 1 && (
        <button
          onClick={onNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow z-10"
        >
          <ChevronRight className="w-5 h-5 text-[#2E2E2E]" />
        </button>
      )}
      {/* Task 4.4: Indicadores — un punto por imagen + uno para video o reel */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {Array.from({ length: intTotalSlides }).map((_, intIdx) => (
          <div
            key={intIdx}
            className={`w-2 h-2 rounded-full ${intIdx === intCurrentIndex ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};