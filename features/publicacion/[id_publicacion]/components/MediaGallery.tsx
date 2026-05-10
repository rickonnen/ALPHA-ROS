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
/**
 * Modificacion
 * @Dev: Gabriel Paredes
 * @Fecha: 10/05/2026
 * @Funcionalidad: Integración del botón de compartir sobre la galería.
 *                 Se añade prop mostrarShare (boolean) y manejo de estado
 *                 bolShareAbierto para abrir/cerrar el ShareModal.
 * @param {boolean} [mostrarShare=false] - Bandera para mostrar el botón de compartir.
 */
"use client";
import React, { useState } from "react";
import { Share2 }                from "lucide-react";
import { MediaGalleryDesktop }   from "./MediaGalleryDesktop";
import { MediaGalleryMobile }    from "./MediaGalleryMobile";
import { MediaGalleryLightbox }  from "./MediaGalleryLightbox";
import FavButton                 from "@/components/ui/fav";
import ShareModal                from "@/features/publicacion/[id_publicacion]/components/ShareModal";

interface MediaGalleryProps {
  id_publicacion: string;
  arrImagenes:    string[];
  strVideoId?:    string;
  strReelId?:     string;
  mostrarFav?:    boolean;
  mostrarShare?:  boolean;
}

export const MediaGallery = ({
  id_publicacion,
  arrImagenes,
  strVideoId,
  strReelId,
  mostrarFav   = false,
  mostrarShare = false,
}: MediaGalleryProps) => {
  const strFallback = "/company-placeholder.png";

  const [intCurrentIndex, setIntCurrentIndex]   = useState(0);
  const [intLightboxIndex, setIntLightboxIndex] = useState<number | null>(null);
  const [arrImagenesRotas, setArrImagenesRotas] = useState<number[]>([]);
  const [bolShareAbierto, setBolShareAbierto]   = useState(false);

  const arrImagenesLimpias = arrImagenes.filter(img =>
    img && typeof img === "string" && img.trim() !== "" && img !== "[]" && !img.includes("null") && !img.includes("undefined")
  );

  let arrImagenesSafe = arrImagenesLimpias.length > 0 ? arrImagenesLimpias : [strFallback];
  arrImagenesSafe = arrImagenesSafe.map((img, idx) => arrImagenesRotas.includes(idx) ? strFallback : img);

  const bolAllFallback = arrImagenesSafe.every(img => img === strFallback || img.includes("placeholder"));
  if (bolAllFallback) {
    arrImagenesSafe = [strFallback];
  }

  const intTotalSlides  = arrImagenesSafe.length + (strVideoId || strReelId ? 1 : 0);
  const safeCurrentIndex = Math.min(intCurrentIndex, Math.max(0, intTotalSlides - 1));

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, intIdx?: number) => {
    e.currentTarget.src = strFallback;
    if (intIdx !== undefined) {
      setArrImagenesRotas((prev) => prev.includes(intIdx) ? prev : [...prev, intIdx]);
    }
  };

  const handleOpenLightbox  = (intIdx: number) => {
    if (arrImagenesSafe[intIdx] === strFallback || arrImagenesSafe[intIdx].includes("placeholder")) return;
    setIntLightboxIndex(intIdx);
  };

  const handleCloseLightbox = () => setIntLightboxIndex(null);
  const handlePrev          = () => setIntCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext          = () => setIntCurrentIndex((i) => Math.min(intTotalSlides - 1, i + 1));
  const handleLightboxPrev  = () => setIntLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const handleLightboxNext  = () => setIntLightboxIndex((i) => (i !== null && i < arrImagenesSafe.length - 1 ? i + 1 : i));

  return (
    <>
      <div className="space-y-6 mb-8 relative">

        {/* Botones superpuestos: Share (arriba) + Fav (abajo) */}
        {(mostrarFav || mostrarShare) && (
          <div className="absolute bottom-6 right-6 md:bottom-14 md:right-8 z-20 flex flex-col items-center gap-2">
            {mostrarShare && (
              <button
                onClick={() => setBolShareAbierto(true)}
                aria-label="Compartir publicación"
                className="
                  w-10 h-10 rounded-full
                  bg-[#29ABE2] hover:bg-[#1A96CC]
                  flex items-center justify-center
                  shadow-md transition-colors duration-200
                  cursor-pointer
                "
              >
                <Share2 className="w-5 h-5 text-white" strokeWidth={2.2} />
              </button>
            )}
            {mostrarFav && (
              <FavButton id_publicacion={id_publicacion} />
            )}
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

      {/* Lightbox */}
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

      {/* Modal de compartir */}
      {bolShareAbierto && (
        <ShareModal
          id_publicacion={id_publicacion}
          onClose={() => setBolShareAbierto(false)}
        />
      )}
    </>
  );
};