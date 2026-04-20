"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel } from "../hooks/useCarousel";
import { useIsMobile } from "../hooks/useIsMobile";

interface BannerImage {
  id: number;
  order: number;
  is_active: boolean;
  image_url?: string;
  image_url_desktop?: string;
  image_url_mobile?: string;
  public_id: string;
}

function getImageUrl(objImage: BannerImage, bolIsMobile: boolean): string {
  if (objImage.image_url) return objImage.image_url;
  if (bolIsMobile && objImage.image_url_mobile) return objImage.image_url_mobile;
  return objImage.image_url_desktop ?? "";
}

const INT_AUTOPLAY_DELAY = 5000;

export default function Banner() {
  const [arrImages, setArrImages] = useState<BannerImage[]>([]);
  const [bolLoading, setBolLoading] = useState<boolean>(true);
  const bolIsMobile = useIsMobile();

  // Carga las imágenes desde la API
  useEffect(() => {
    async function fetchBannerImages() {
      try {
        const objResponse = await fetch("/api/home/bannerHome");
        const arrData = await objResponse.json();
        setArrImages(arrData);
      } catch (objError) {
        console.error("Error al cargar el banner:", objError);
      } finally {
        setBolLoading(false);
      }
    }

    fetchBannerImages();
  }, []);

  const arrActiveImages = useMemo(
    () =>
      arrImages
        .filter((objImage) => objImage.is_active)
        .sort((a, b) => a.order - b.order),
    [arrImages],
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

  if (bolLoading) {
    return (
      <section className="w-full overflow-hidden font-sans">
        <div className="flex h-[63svh] items-center justify-center bg-muted animate-pulse" />
      </section>
    );
  }

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
              key={objImage.public_id}
              className="relative h-full min-w-full flex-shrink-0"
            >
              <img
                src={getImageUrl(objImage, bolIsMobile)}
                alt={`Banner ${intIndex + 1}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
                draggable={false}
              />

              {intIndex === 0 && (
                <>
                  <div className="absolute inset-0 bg-black/35" />
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
                </>
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
                  key={objImage.public_id}
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