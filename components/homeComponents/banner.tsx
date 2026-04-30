"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel } from "../hooks/useCarousel";
import { useIsMobile } from "../hooks/useIsMobile";
import HelpButton from "./BotonAyuda";

interface BannerImage {
  id: number;
  order: number;
  is_active: boolean;
  image_url?: string;
  image_url_desktop?: string;
  image_url_mobile?: string;
  public_id: string;
}

function getImageUrl(
  objImage: BannerImage,
  bolIsMobile: boolean,
  bolIsLandscape: boolean,
): string {
  if (objImage.image_url) return objImage.image_url;
  // Si es móvil y está en vertical (!bolIsLandscape), mostramos la imagen móvil
  if (bolIsMobile && !bolIsLandscape && objImage.image_url_mobile) {
    return objImage.image_url_mobile;
  }
  // En cualquier otro caso (Desktop, o Móvil en Horizontal), mostramos la de desktop
  return objImage.image_url_desktop ?? "";
}

const INT_AUTOPLAY_DELAY = 5000;

export default function Banner() {
  const [arrImages, setArrImages] = useState<BannerImage[]>([]);
  const [bolLoading, setBolLoading] = useState<boolean>(true);
  const [bolIsLandscape, setBolIsLandscape] = useState<boolean>(false);
  const bolIsMobile = useIsMobile();

  // Detecta cambios en la orientación del dispositivo
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(orientation: landscape)");
      setBolIsLandscape(mediaQuery.matches);

      const handleOrientationChange = (e: MediaQueryListEvent) => {
        setBolIsLandscape(e.matches);
      };

      mediaQuery.addEventListener("change", handleOrientationChange);
      return () =>
        mediaQuery.removeEventListener("change", handleOrientationChange);
    }
  }, []);

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
        {/* CAMBIO 1: Eliminada max-w y mx-auto en el skeleton para ancho completo */}
        <div className="flex w-full animate-pulse items-center justify-center bg-muted aspect-square portrait:aspect-square landscape:aspect-[1600/656] md:aspect-[1600/656]" />
      </section>
    );
  }

  if (arrActiveImages.length === 0) {
    return (
      <section className="w-full overflow-hidden font-sans">
        {/* CAMBIO 2: Eliminada max-w y mx-auto en el mensaje de error para ancho completo */}
        <div className="flex w-full items-center justify-center bg-muted px-6 text-center aspect-square portrait:aspect-square landscape:aspect-[1600/656] md:aspect-[1600/656]">
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
        className="relative w-full overflow-hidden aspect-square portrait:aspect-square landscape:aspect-[1600/656] md:aspect-[1600/656]"
        {...touchHandlers}
      >
        <div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6">
          <HelpButton />
        </div>
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
                src={getImageUrl(objImage, bolIsMobile, bolIsLandscape)}
                alt={`Banner ${intIndex + 1}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
                draggable={false}
              />

              {intIndex === 0 && (
                <>
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute inset-0 flex items-center justify-center px-4 text-center sm:px-6 md:px-8 lg:px-10">
                    {/* CAMBIO 4: Eliminada max-w-[320px] y sm:max-w-2xl para que el texto ocupe más espacio si es necesario */}
                    <div className="select-none lg:max-w-4xl">
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
            {/* ... (botones de navegación y carrusel permanecen iguales, pero se alejan más hacia afuera al estar en ancho completo) */}
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
              {arrActiveImages.map(
                (objImage: BannerImage, intIndex: number) => (
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
                ),
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}