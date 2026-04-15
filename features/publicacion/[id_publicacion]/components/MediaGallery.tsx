/**
 * Dev: Marcela C.
 * Date: 26/03/2026
 * Funcionalidad: Orquestador de la galería multimedia del perfil del inmueble
 *                (HU4 - Tasks 4.4, 4.5, 4.11, 4.12)
 * @param arrImagenes - URLs de imágenes reales desde modelo Imagen
 * @param strVideoId  - ID extraído del video YouTube (opcional)
 * @param strReelId   - ID extraído del Reel de Instagram (opcional)
 * @return JSX con galería desktop, mobile y lightbox integrados
 */
"use client";
import React, { useState } from "react";
import { MediaGalleryDesktop }  from "./MediaGalleryDesktop";
import { MediaGalleryMobile }   from "./MediaGalleryMobile";
import { MediaGalleryLightbox } from "./MediaGalleryLightbox";
interface MediaGalleryProps {
  arrImagenes: string[];
  strVideoId?: string;
  strReelId?:  string;
}
export const MediaGallery = ({ arrImagenes, strVideoId, strReelId }: MediaGalleryProps) => {
  const strFallback = "/company-placeholder.png"; // Task 4.11: fallback empresa
  const [intCurrentIndex, setIntCurrentIndex]   = useState(0);
  const [intLightboxIndex, setIntLightboxIndex] = useState<number | null>(null);
  // Task 4.11: Trackear índices de imágenes rotas
  const [arrImagenesRotas, setArrImagenesRotas] = useState<number[]>([]);
  // Task 4.11: Si no hay imágenes usar fallback
  const arrImagenesSafe = arrImagenes.length > 0 ? arrImagenes : [strFallback];
  // Task 4.5: Total slides = imágenes + 1 si hay video o reel
const intTotalSlides = arrImagenesSafe.length + (strVideoId || strReelId ? 1 : 0);
  // Task 4.11: Guardar índice de imagen rota y mostrar fallback
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, intIdx?: number) => {
    e.currentTarget.src = strFallback;
    if (intIdx !== undefined) {
      setArrImagenesRotas((prev) => [...prev, intIdx]);
    }
  };
  // Task 4.11: Solo abrir lightbox si la imagen no es el fallback
const handleOpenLightbox = (intIdx: number) => {
  // Si el array original no tenía imagen en ese índice, no abrir
  if (!arrImagenes[intIdx] || arrImagenes[intIdx] === "") return;
  // Si está en la lista de rotas, no abrir
  if (arrImagenesRotas.includes(intIdx)) return;
  setIntLightboxIndex(intIdx);
};
  const handleCloseLightbox = () => setIntLightboxIndex(null);
  const handlePrev          = () => setIntCurrentIndex((i) => i - 1);
  const handleNext          = () => setIntCurrentIndex((i) => i + 1);
  // Task 4.4: Handlers de navegación del lightbox
  const handleLightboxPrev  = () => setIntLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const handleLightboxNext  = () => setIntLightboxIndex((i) => (i !== null && i < arrImagenesSafe.length - 1 ? i + 1 : i));
  return (
    <>
      <div className="space-y-6 mb-8">
        {/* Task 4.4 + 4.5 + 4.11: Grilla desktop — componente de Marcela */}
        <MediaGalleryDesktop
          arrImagenesSafe={arrImagenesSafe}
          strVideoId={strVideoId}
          strReelId={strReelId}
          intCurrentIndex={intCurrentIndex}
          strFallback={strFallback}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenLightbox={handleOpenLightbox}
          onImgError={handleImgError}
        />
        {/* Task 4.4 + 4.5 + 4.12: Carrusel mobile — componente de Marcela */}
        <MediaGalleryMobile
          arrImagenesSafe={arrImagenesSafe}
          strVideoId={strVideoId}
          strReelId={strReelId}
          intCurrentIndex={intCurrentIndex}
          intTotalSlides={intTotalSlides}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenLightbox={handleOpenLightbox}
          onImgError={handleImgError}
        />
      </div>
      {/* Task 4.4: Lightbox al click — componente de Gustavo */}
      {intLightboxIndex !== null && (
        <MediaGalleryLightbox
          arrImagenesSafe={arrImagenesSafe}
          intLightboxIndex={intLightboxIndex}
          onClose={handleCloseLightbox}
          onPrev={handleLightboxPrev}
          onNext={handleLightboxNext}
          onImgError={handleImgError}
        />
      )}
    </>
  );
};