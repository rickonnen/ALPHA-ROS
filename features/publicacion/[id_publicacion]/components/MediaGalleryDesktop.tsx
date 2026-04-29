/**
 * Dev: Gustavo Montaño
 * Date: 07/04/2026
 * Funcionalidad: Grilla desktop adaptativa según cantidad de media (HU4 - Tasks 4.4, 4.5, 4.11)
 * @param arrImagenesSafe - URLs de imágenes con fallback aplicado
 * @param strVideoId      - ID del video YouTube (opcional)
 * @param strReelId       - ID del Reel de Instagram (opcional)
 * @param intCurrentIndex - Índice actual del carrusel principal
 * @param strFallback     - URL de imagen de empresa por defecto
 * @param onPrev          - Función para navegar a la imagen anterior
 * @param onNext          - Función para navegar a la imagen siguiente
 * @param onOpenLightbox  - Función para abrir el lightbox en un índice dado
 * @param onImgError      - Función para manejar error de imagen con fallback
 * @return JSX con grilla adaptativa visible solo en desktop
 */
import React from "react";
import { ChevronLeft, ChevronRight, ZoomIn, AlertTriangle } from "lucide-react";

// FIX: Componente reutilizable con el diseño exacto del AlertTriangle
  const FallbackOverlay = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2E2E2E]/50 pointer-events-none z-10 backdrop-blur-[2px]">
      <AlertTriangle className="w-8 h-8 text-white/90 mb-2" strokeWidth={1.5} />
      <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md px-2 text-center">
        Imagen no disponible
      </span>
    </div>
  );
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
}: MediaGalleryDesktopProps) => {
const bolHasVideo    = !!(strVideoId || strReelId);
  const intImgCount    = arrImagenesSafe.length;
  const bolCase1 = intImgCount === 1 && !bolHasVideo;
  const bolCase2 = (intImgCount === 2 && !bolHasVideo) || (intImgCount === 1 && bolHasVideo);

  // FIX: Función para detectar si cualquier imagen está rota
  const isFallback = (imgUrl: string) => !imgUrl || imgUrl === strFallback || imgUrl.includes("placeholder");

  

  const bolIsFallbackPrincipal = isFallback(arrImagenesSafe[intCurrentIndex]);

  const SlotPrincipal = (
    <div className={`relative bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm h-full ${!bolIsFallbackPrincipal ? 'group cursor-pointer' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={arrImagenesSafe[intCurrentIndex]}
        onError={(e) => onImgError(e, intCurrentIndex)}
        onClick={() => { if(!bolIsFallbackPrincipal) onOpenLightbox(intCurrentIndex) }}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${!bolIsFallbackPrincipal ? 'group-hover:scale-105' : ''}`}
        alt={`Vista ${intCurrentIndex + 1}`}
      />
      
      {/* FIX RM02-02: Nuevo letrero con ícono */}
      {bolIsFallbackPrincipal && <FallbackOverlay />}

      {/* Solo mostramos la Lupa si NO es el fallback */}
      {!bolIsFallbackPrincipal && (
        <div
          onClick={() => onOpenLightbox(intCurrentIndex)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10"
        >
          <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
      )}

      {intCurrentIndex > 0 && !bolCase2 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition z-10"
        >
          <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
        </button>
      )}
      {intCurrentIndex < arrImagenesSafe.length - 1 && !bolCase2 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition z-10"
        >
          <ChevronRight className="w-5 h-5 text-[#2E2E2E]" />
        </button>
      )}
      {intImgCount > 1 && !bolCase2 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {arrImagenesSafe.map((_, intIdx) => (
            <div
              key={intIdx}
              className={`w-2 h-2 rounded-full transition-all ${intIdx === intCurrentIndex ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
  const SlotVideo = strVideoId ? (
    <iframe
      className="w-full h-full border-0 rounded-2xl"
      src={`https://www.youtube.com/embed/${strVideoId}`}
      title="Video del inmueble"
      allowFullScreen
    />
  ) : strReelId ? (
    <iframe
      className="w-full h-full border-0 rounded-2xl"
      src={`https://www.instagram.com/reel/${strReelId}/embed`}
      title="Reel del inmueble"
      allowFullScreen
    />
  ) : null;
  if (bolCase1) {
    return (
      <div className="hidden lg:block h-125">
        {SlotPrincipal}
      </div>
    );
  }
  if (bolCase2) {
    const bolIsFallbackSec = isFallback(arrImagenesSafe[1]);
    return (
      <div className="hidden lg:grid grid-cols-2 gap-4 h-125">
        {SlotPrincipal}
        <div className="bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-inner">
          {bolHasVideo ? (
            SlotVideo
          ) : (
            <div className={`relative w-full h-full ${!bolIsFallbackSec ? 'group cursor-pointer' : ''}`} onClick={() => { if(!bolIsFallbackSec) onOpenLightbox(1) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={arrImagenesSafe[1]}
                onError={(e) => onImgError(e, 1)}
                className={`w-full h-full object-cover transition-transform duration-300 ${!bolIsFallbackSec ? 'group-hover:scale-105' : ''}`}
                alt="Vista secundaria"
              />
              {bolIsFallbackSec && <FallbackOverlay />}
              {!bolIsFallbackSec && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                  <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
const intSlot2Idx = bolHasVideo ? (intCurrentIndex + 1) % intImgCount : (intCurrentIndex + 1) % intImgCount;
  const intSlot3Idx = (intCurrentIndex + (bolHasVideo ? 1 : 2)) % intImgCount;

  const imgSlot2 = arrImagenesSafe[intSlot2Idx];
  const bolIsFallback2 = isFallback(imgSlot2);
  
  const imgSlot3 = arrImagenesSafe[bolHasVideo ? intSlot2Idx : intSlot3Idx] || strFallback;
  const bolIsFallback3 = isFallback(imgSlot3);

  return (
    <div className="hidden lg:grid grid-cols-3 gap-4 h-125">
      <div className="col-span-2 h-full">
        {SlotPrincipal}
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-inner">
          {bolHasVideo ? (
            SlotVideo
          ) : (
            <div className={`relative w-full h-full ${!bolIsFallback2 ? 'group cursor-pointer' : ''}`} onClick={() => { if(!bolIsFallback2) onOpenLightbox(intSlot2Idx) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSlot2}
                onError={(e) => onImgError(e, intSlot2Idx)}
                className={`w-full h-full object-cover transition-transform duration-300 ${!bolIsFallback2 ? 'group-hover:scale-105' : ''}`}
                alt="Vista secundaria"
              />
              {bolIsFallback2 && <FallbackOverlay />}
              {!bolIsFallback2 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                  <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className={`h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm relative ${!bolIsFallback3 ? 'group cursor-pointer' : ''}`}
          onClick={() => { if(!bolIsFallback3) onOpenLightbox(bolHasVideo ? intSlot2Idx : intSlot3Idx) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSlot3}
            onError={(e) => onImgError(e, bolHasVideo ? intSlot2Idx : intSlot3Idx)}
            className={`w-full h-full object-cover transition-transform duration-300 ${!bolIsFallback3 ? 'group-hover:scale-105' : ''}`}
            alt="Vista adicional"
          />
          {bolIsFallback3 && <FallbackOverlay />}
          {!bolIsFallback3 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
              <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};