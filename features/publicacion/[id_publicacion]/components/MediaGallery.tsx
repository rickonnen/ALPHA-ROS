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
/**
 * Modicacion
 * @Dev: Gustavo Montaño
 * @Fecha: 18/04/2026
 * @Funcionalidad: Integración de renderizado condicional para el botón "Favoritos" (HU2/HU6) sobre la galería existente.
 * @param {string} id_publicacion - Identificador de la publicación para ejecutar la acción de guardado.
 * @param {boolean} [mostrarFav=false] - Bandera para habilitar o deshabilitar la visibilidad del componente FavButton.
 * @return {JSX.Element} Renderizado condicional del botón de favoritos superpuesto en la galería.
 */
"use client";
import React, { useState } from "react";
import { MediaGalleryDesktop }  from "./MediaGalleryDesktop";
import { MediaGalleryMobile }   from "./MediaGalleryMobile";
import { MediaGalleryLightbox } from "./MediaGalleryLightbox";
import FavButton from "@/components/ui/fav";
interface MediaGalleryProps {
  id_publicacion: string;
  arrImagenes: string[];
  strVideoId?: string;
  strReelId?:  string;
  mostrarFav?: boolean;
}
export const MediaGallery = ({ id_publicacion, arrImagenes, strVideoId, strReelId, mostrarFav = false }: MediaGalleryProps) => {
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
      {/* 4. AÑADIMOS relative group AL CONTENEDOR PARA POSICIONAR EL BOTÓN */}
      <div className="space-y-6 mb-8 relative">
        {/* 5. EL BOTÓN CONDICIONADO */}
        {mostrarFav && (
          <div className="absolute bottom-6 right-6 md:bottom-14 md:right-8 z-20">
            <FavButton id_publicacion={id_publicacion} />
          </div>
        )}
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