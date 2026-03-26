/**
 * Dev: Marcela C.
 * Date: 25/03/2026
 * Funcionalidad: Galería con carrusel, flechas y lightbox al click
 *                (HU4 - Tasks 4.4, 4.5, 4.11, 4.12)
 * @param arrImagenes - URLs de imágenes reales desde modelo Imagen
 * @param strVideoId  - ID extraído del video YouTube (opcional)
 */
"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface MediaGalleryProps {
  arrImagenes: string[];
  strVideoId?: string;
}

export const MediaGallery = ({ arrImagenes, strVideoId }: MediaGalleryProps) => {
  const strFallback = "/company-placeholder.png"; // Task 4.11
  const [intCurrentIndex, setIntCurrentIndex] = useState(0);
  const [intLightboxIndex, setIntLightboxIndex] = useState<number | null>(null);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = strFallback;
  };

  const arrImagenesSafe = arrImagenes.length > 0 ? arrImagenes : [strFallback];

  const handleOpenLightbox  = (intIdx: number) => setIntLightboxIndex(intIdx);
  const handleCloseLightbox = () => setIntLightboxIndex(null);
  const handleLightboxPrev  = () => setIntLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const handleLightboxNext  = () => setIntLightboxIndex((i) => (i !== null && i < arrImagenesSafe.length - 1 ? i + 1 : i));

  return (
    <>
      <div className="space-y-6 mb-8">

        {/* Task 4.4 + 4.12: Desktop — 3 slots fijos con flechas en imagen principal */}
        <div className="hidden md:grid grid-cols-3 gap-4 h-[500px]">

          {/* Slot 1: Imagen principal grande con flechas y click */}
          <div className="col-span-2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer">
            <img
              src={arrImagenesSafe[intCurrentIndex]}
              onError={handleImgError}
              onClick={() => handleOpenLightbox(intCurrentIndex)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              alt={`Vista ${intCurrentIndex + 1}`}
            />
            {/* Ícono zoom al hover */}
            <div
              onClick={() => handleOpenLightbox(intCurrentIndex)}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10"
            >
              <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            {/* Flecha izquierda */}
            {intCurrentIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIntCurrentIndex((i) => i - 1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition z-10"
              >
                <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
              </button>
            )}
            {/* Flecha derecha */}
            {intCurrentIndex < arrImagenesSafe.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setIntCurrentIndex((i) => i + 1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition z-10"
              >
                <ChevronRight className="w-5 h-5 text-[#2E2E2E]" />
              </button>
            )}
            {/* Indicadores */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {arrImagenesSafe.map((_, intIdx) => (
                <div
                  key={intIdx}
                  className={`w-2 h-2 rounded-full transition-all ${intIdx === intCurrentIndex ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* Columna derecha: slot 2 y slot 3 */}
          <div className="flex flex-col gap-4">
            {/* Slot 2: video si existe, imagen 2 si no */}
            <div className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-inner">
              {strVideoId ? (
                <iframe
                  className="w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${strVideoId}`}
                  title="Video del inmueble"
                  allowFullScreen
                />
              ) : (
                <img
                  src={arrImagenesSafe[1] || strFallback}
                  onError={handleImgError}
                  onClick={() => handleOpenLightbox(1)}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                  alt="Vista secundaria"
                />
              )}
            </div>
            {/* Slot 3: imagen 2 si hay video, imagen 3 si no */}
            <div
              className="h-1/2 bg-[#E7E1D7] rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition"
              onClick={() => handleOpenLightbox(strVideoId ? 1 : 2)}
            >
              <img
                src={strVideoId ? (arrImagenesSafe[1] || strFallback) : (arrImagenesSafe[2] || strFallback)}
                onError={handleImgError}
                className="w-full h-full object-cover"
                alt="Vista adicional"
              />
            </div>
          </div>
        </div>

        {/* Task 4.4 + 4.12: Mobile — carrusel con flechas */}
        <div className="md:hidden relative h-[280px] bg-[#E7E1D7] rounded-2xl overflow-hidden">
          <img
            src={arrImagenesSafe[intCurrentIndex]}
            onError={handleImgError}
            onClick={() => handleOpenLightbox(intCurrentIndex)}
            className="w-full h-full object-cover cursor-pointer"
            alt={`Imagen ${intCurrentIndex + 1}`}
          />
          {intCurrentIndex > 0 && (
            <button
              onClick={() => setIntCurrentIndex((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
            >
              <ChevronLeft className="w-5 h-5 text-[#2E2E2E]" />
            </button>
          )}
          {intCurrentIndex < arrImagenesSafe.length - 1 && (
            <button
              onClick={() => setIntCurrentIndex((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"
            >
              <ChevronRight className="w-5 h-5 text-[#2E2E2E]" />
            </button>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {arrImagenesSafe.map((_, intIdx) => (
              <div
                key={intIdx}
                className={`w-2 h-2 rounded-full ${intIdx === intCurrentIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>

        {/* Task 4.5: Video mobile */}
        {strVideoId && (
          <div className="md:hidden w-full aspect-video rounded-2xl overflow-hidden shadow-sm">
            <iframe
              className="w-full h-full border-0"
              src={`https://www.youtube.com/embed/${strVideoId}`}
              title="Video del inmueble"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Lightbox — vista previa al click */}
      {intLightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseLightbox}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={arrImagenesSafe[intLightboxIndex]}
              onError={handleImgError}
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
              alt={`Vista ampliada ${intLightboxIndex + 1}`}
            />
            {/* Botón cerrar */}
            <button
              onClick={handleCloseLightbox}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-[#2E2E2E]" />
            </button>
            {/* Flecha izquierda lightbox */}
            {intLightboxIndex > 0 && (
              <button
                onClick={handleLightboxPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition"
              >
                <ChevronLeft className="w-6 h-6 text-[#2E2E2E]" />
              </button>
            )}
            {/* Flecha derecha lightbox */}
            {intLightboxIndex < arrImagenesSafe.length - 1 && (
              <button
                onClick={handleLightboxNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition"
              >
                <ChevronRight className="w-6 h-6 text-[#2E2E2E]" />
              </button>
            )}
            {/* Contador */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {intLightboxIndex + 1} / {arrImagenesSafe.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};