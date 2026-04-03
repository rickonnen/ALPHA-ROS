/**
 * Dev: Gustavo Montaño
 * Date: 26/03/2026
 * Funcionalidad: Lightbox modal para visualización ampliada de imágenes
 *                (HU4 - Task 4.4)
 * @param arrImagenesSafe  - URLs de imágenes con fallback aplicado
 * @param intLightboxIndex - Índice de la imagen actualmente visible en el lightbox
 * @param onClose          - Función para cerrar el lightbox
 * @param onPrev           - Función para navegar a la imagen anterior
 * @param onNext           - Función para navegar a la imagen siguiente
 * @param onImgError       - Función para manejar error de imagen con fallback
 * @return JSX con overlay modal de pantalla completa
 */
import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
interface MediaGalleryLightboxProps {
  arrImagenesSafe:  string[];
  intLightboxIndex: number;
  onClose:          () => void;
  onPrev:           () => void;
  onNext:           () => void;
  onImgError:       (e: React.SyntheticEvent<HTMLImageElement>) => void;
}
export const MediaGalleryLightbox = ({
  arrImagenesSafe,
  intLightboxIndex,
  onClose,
  onPrev,
  onNext,
  onImgError,
}: MediaGalleryLightboxProps) => (
  // Task 4.4: Fondo oscuro — click fuera cierra el lightbox
  <div
    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Task 4.4: Imagen ampliada */}
     {/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src={arrImagenesSafe[intLightboxIndex]}
  onError={onImgError}
  className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
  alt={`Vista ampliada ${intLightboxIndex + 1}`}
/>
      {/* Task 4.4: Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
      >
        <X className="w-5 h-5 text-[#2E2E2E]" />
      </button>
      {/* Task 4.4: Flecha izquierda lightbox */}
      {intLightboxIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition"
        >
          <ChevronLeft className="w-6 h-6 text-[#2E2E2E]" />
        </button>
      )}
      {/* Task 4.4: Flecha derecha lightbox */}
      {intLightboxIndex < arrImagenesSafe.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition"
        >
          <ChevronRight className="w-6 h-6 text-[#2E2E2E]" />
        </button>
      )}
      {/* Task 4.4: Contador de posición */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
        {intLightboxIndex + 1} / {arrImagenesSafe.length}
      </div>
    </div>
  </div>
);