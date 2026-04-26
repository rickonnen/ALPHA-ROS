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
const strFallback = "/company-placeholder.png"; 
  const [intCurrentIndex, setIntCurrentIndex]   = useState(0);
  const [intLightboxIndex, setIntLightboxIndex] = useState<number | null>(null);
  const [arrImagenesRotas, setArrImagenesRotas] = useState<number[]>([]);

  const arrImagenesLimpias = arrImagenes.filter(img => 
    img && typeof img === 'string' && img.trim() !== "" && img !== "[]" && !img.includes("null") && !img.includes("undefined")
  );

  let arrImagenesSafe = arrImagenesLimpias.length > 0 ? arrImagenesLimpias : [strFallback];
  arrImagenesSafe = arrImagenesSafe.map((img, idx) => arrImagenesRotas.includes(idx) ? strFallback : img);

  //FIX: Si todas las fotos son fallbacks o placeholders, colapsamos el array a 1 solo elemento
  const bolAllFallback = arrImagenesSafe.every(img => img === strFallback || img.includes("placeholder"));
  if (bolAllFallback) {
    arrImagenesSafe = [strFallback];
  }
// Primero calculamos el total real de slides (Imágenes + Video)
  const intTotalSlides = arrImagenesSafe.length + (strVideoId || strReelId ? 1 : 0);
  
  //FIX: Protegemos el índice permitiendo que llegue hasta el video
  const safeCurrentIndex = Math.min(intCurrentIndex, Math.max(0, intTotalSlides - 1));

  //FIX: Evitar bucles asegurando que no se repitan índices en el state
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, intIdx?: number) => {
    e.currentTarget.src = strFallback;
    if (intIdx !== undefined) {
      setArrImagenesRotas((prev) => prev.includes(intIdx) ? prev : [...prev, intIdx]);
    }
  };

  const handleOpenLightbox = (intIdx: number) => {
    if (arrImagenesSafe[intIdx] === strFallback || arrImagenesSafe[intIdx].includes("placeholder")) return;
    setIntLightboxIndex(intIdx);
  };

  const handleCloseLightbox = () => setIntLightboxIndex(null);
  const handlePrev          = () => setIntCurrentIndex((i) => Math.max(0, i - 1));
  
  //FIX RM02-02: La flecha derecha ahora respeta el slide extra del video
  const handleNext          = () => setIntCurrentIndex((i) => Math.min(intTotalSlides - 1, i + 1));
  
  const handleLightboxPrev  = () => setIntLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const handleLightboxNext  = () => setIntLightboxIndex((i) => (i !== null && i < arrImagenesSafe.length - 1 ? i + 1 : i));
  return (
    <>
      <div className="space-y-6 mb-8 relative">
        {mostrarFav && (
          <div className="absolute bottom-6 right-6 md:bottom-14 md:right-8 z-20">
            <FavButton id_publicacion={id_publicacion} />
          </div>
        )}
        <MediaGalleryDesktop
          arrImagenesSafe={arrImagenesSafe}
          strVideoId={strVideoId}
          strReelId={strReelId}
          intCurrentIndex={safeCurrentIndex}
          strFallback={strFallback}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenLightbox={handleOpenLightbox}
          onImgError={handleImgError}
        />
        <MediaGalleryMobile
          arrImagenesSafe={arrImagenesSafe}
          strVideoId={strVideoId}
          strReelId={strReelId}
          intCurrentIndex={safeCurrentIndex}   
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