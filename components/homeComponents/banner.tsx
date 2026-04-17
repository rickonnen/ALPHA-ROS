"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel } from "../hooks/useCarousel";
import { useIsMobile } from "../hooks/useIsMobile";

/**
 * @Dev: Rodrigo Chalco     Fecha: 26/03/2026
 * Funcionalidad: Renderiza el banner principal del Home con imágenes cargadas
 * desde Cloudinary. El texto se muestra solo en la primera imagen del carrusel.
 * Desde la segunda imagen en adelante soporta versión desktop y mobile.
 */

interface BannerImage {
  intId: number;
  strImageUrl?: string;
  strImageUrlDesktop?: string;
  strImageUrlMobile?: string;
  strPublicId: string;
  bolIsActive: boolean;
  intOrder: number;
}

/**
 * Retorna la URL correcta según dispositivo.
 * - Primera imagen: usa strImageUrl (responsive única)
 * - Resto: usa strImageUrlMobile o strImageUrlDesktop según el dispositivo
 */
function getImageUrl(objImage: BannerImage, bolIsMobile: boolean): string {
  if (objImage.strImageUrl) {
    return objImage.strImageUrl;
  }

  if (bolIsMobile && objImage.strImageUrlMobile) {
    return objImage.strImageUrlMobile;
  }

  return objImage.strImageUrlDesktop ?? "";
}

const INT_AUTOPLAY_DELAY: number = 5000;

const ARR_BANNER_IMAGES: BannerImage[] = [
  {
    intId: 1,
    strImageUrl:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774558931/pexels-binyaminmellish-1396122_i3p4d2.jpg",
    strPublicId: "banner_inicio/1",
    bolIsActive: true,
    intOrder: 1,
  },
  {
    intId: 2,
    strImageUrlDesktop:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1775801912/final_de_los_finales_ousbkl.png",
    strImageUrlMobile:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1775801412/esta_02_1_m3tquo.png",
    strPublicId: "banner_inicio/2",
    bolIsActive: true,
    intOrder: 2,
  },
  {
    intId: 3,
    strImageUrlDesktop:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1775794035/pubilcacion2_z49hqo.png",
    strImageUrlMobile:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1775794414/movil2_xb4ehq.png",
    strPublicId: "banner_inicio/3",
    bolIsActive: true,
    intOrder: 3,
  },
];

export default function Banner() {
  const bolIsMobile = useIsMobile();

  const arrActiveImages: BannerImage[] = useMemo(
    () =>
      ARR_BANNER_IMAGES.filter(
        (objImage: BannerImage) => objImage.bolIsActive,
      ).sort(
        (objFirstImage: BannerImage, objSecondImage: BannerImage) =>
          objFirstImage.intOrder - objSecondImage.intOrder,
      ),
    [],
  );

  const {
    intCurrentIndex,
    objBannerRef,
    bolShowControls,
    goToNextImage,
    goToPreviousImage,
    goToSelectedImage,
    touchHandlers,
  } = useCarousel({
    intTotalItems: arrActiveImages.length,
    intAutoPlayDelay: INT_AUTOPLAY_DELAY,
  });

  if (arrActiveImages.length === 0) {
    return (
      <section className="w-full overflow-hidden font-sans">
        <div className="flex h-[56svh] items-center justify-center bg-muted px-6 text-center">
          <p className="text-sm text-muted-foreground sm:text-base">
            No hay imágenes activas para mostrar en el banner.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={objBannerRef}
      className="w-full overflow-hidden font-sans"
      aria-label="Main home banner"
    >
      <div
        className="relative h-[63svh] sm:h-[66svh] md:h-[68svh] lg:h-[70svh] xl:h-[73svh] overflow-hidden"
        {...touchHandlers}
      >
        <div
          className="absolute inset-0 flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${intCurrentIndex * 100}%)` }}
        >
          {arrActiveImages.map((objImage: BannerImage, intIndex: number) => (
            <div
              key={objImage.strPublicId}
              className="relative h-full min-w-full flex-shrink-0"
            >
              <img
                src={getImageUrl(objImage, bolIsMobile)}
                alt={`Banner ${intIndex + 1}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
                draggable={false}
              />

              {intIndex === 0 && (
                <div className="absolute inset-0 bg-black/35" />
              )}

              {intIndex === 0 && (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center sm:px-6 md:px-8 lg:px-10">
                  <div className="max-w-[320px] sm:max-w-2xl lg:max-w-4xl select-none">
                    <h1 className="text-4xl font-bold leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem]">
                      Encuentra el lugar donde
                      <br />
                      <span className="font-light italic text-amber-200">
                        tus sueños
                      </span>{" "}
                      comienzan
                    </h1>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {bolShowControls && (
          <>
            <button
              type="button"
              onClick={goToPreviousImage}
              className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-5 sm:p-3"
              aria-label="Mostrar imagen anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={goToNextImage}
              className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-5 sm:p-3"
              aria-label="Mostrar siguiente imagen"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
              {arrActiveImages.map((objImage: BannerImage, intIndex: number) => (
                <button
                  key={objImage.strPublicId}
                  type="button"
                  onClick={() => goToSelectedImage(intIndex)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    intIndex === intCurrentIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Ir a la imagen ${intIndex + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}