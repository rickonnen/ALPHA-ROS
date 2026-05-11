"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel } from "../hooks/useCarousel";
import HelpButton from "./BotonAyuda";

interface BannerImage {
  id: number;
  order: number;
  is_active: boolean;
  image_url?: string;
  image_url_desktop?: string;
  image_url_mobile?: string;
  image_alt?: string;
  public_id: string;
}

// ─── 1. Hook de viewport — SSR-safe ──────────────────────────────────────────
function useViewport() {
  const [state, setState] = useState({
    isMobile: false,
    isLandscape: false,
  });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      setState({
        isMobile: w < 768,
        isLandscape: w > h,
      });
    }

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return state;
}

// ─── 2. Selección de imagen con fallback ─────────────────────────────────────
const PLACEHOLDER_IMAGE = "/images/banner-placeholder.jpg";

function getImageUrl(
  image: BannerImage,
  isMobile: boolean,
  isLandscape: boolean,
): string {
  if (image.image_url) return image.image_url;

  if (isMobile && !isLandscape && image.image_url_mobile) {
    return image.image_url_mobile;
  }

  return image.image_url_desktop ?? PLACEHOLDER_IMAGE;
}

const AUTOPLAY_DELAY = 5000;

export default function Banner() {
  const [images, setImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const { isMobile, isLandscape } = useViewport();

  // ─── 3. prefers-reduced-motion ───────────────────────────────────────────
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReducedMotion(mq.matches);

    const handler = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);

    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── 4. Carga de imágenes ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchImages() {
      try {
        const objResponse = await fetch("/api/home/bannerHome");

        if (!objResponse.ok) {
          throw new Error(`HTTP ${objResponse.status}`);
        }

        const arrData = await objResponse.json();

        setImages(Array.isArray(arrData) ? arrData : []);
      } catch (objError) {
        console.error("Error al cargar el banner:", objError);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  // ─── 5. Filtrar imágenes activas y con URL válida ────────────────────────
  const activeImages = useMemo(
    () =>
      images
        .filter(
          (image) =>
            image.is_active &&
            (image.image_url ||
              image.image_url_desktop ||
              image.image_url_mobile),
        )
        .sort((firstImage, secondImage) => firstImage.order - secondImage.order),
    [images],
  );

  // ─── 6. Carrusel ─────────────────────────────────────────────────────────
  const {
    intCurrentIndex,
    containerRef,
    bolShowControls,
    goToNextImage,
    goToPreviousImage,
    goToSelectedImage,
    touchHandlers,
  } = useCarousel({
    intTotalItems: activeImages.length,
    intAutoPlayDelay: reducedMotion ? 999999 : AUTOPLAY_DELAY,
  });

  // ─── 7. Aspect ratio dinámico ─────────────────────────────────────────────
  const aspectClass =
    isMobile && !isLandscape ? "aspect-square" : "aspect-[1600/656]";

  // ─── 8. Clases de texto sin template literals condicionales ──────────────
  const titleSizeClass =
    isMobile && isLandscape
      ? "text-xl sm:text-2xl"
      : "text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[5rem]";

  // ─── Estados de carga / error / vacío ────────────────────────────────────
  if (loading) {
    return (
      <section className="w-full overflow-hidden font-sans">
        <div className={`flex w-full animate-pulse bg-muted ${aspectClass}`} />
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="w-full overflow-hidden font-sans">
        <div
          className={`flex w-full flex-col items-center justify-center gap-3 bg-muted px-6 text-center ${aspectClass}`}
        >
          <p className="text-sm text-muted-foreground sm:text-base">
            No se pudo cargar el banner. Intenta recargar la página.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Recargar
          </button>
        </div>
      </section>
    );
  }

  if (activeImages.length === 0) {
    return (
      <section className="w-full overflow-hidden font-sans">
        <div
          className={`flex w-full items-center justify-center bg-muted px-6 text-center ${aspectClass}`}
        >
          <p className="text-sm text-muted-foreground sm:text-base">
            No hay imágenes activas para mostrar en el banner.
          </p>
        </div>
      </section>
    );
  }

  // ─── Render principal ─────────────────────────────────────────────────────
  return (
    <section
      ref={containerRef}
      className="w-full overflow-hidden font-sans"
      aria-label="Banner principal"
    >
      <div
        className={`relative w-full overflow-hidden ${aspectClass}`}
        {...touchHandlers}
      >
        {/* Botón de ayuda */}
        <div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6">
          <HelpButton />
        </div>

        {/* Carrusel de imágenes */}
        <div
          className="absolute inset-0 flex h-full"
          style={{
            transform: `translateX(-${intCurrentIndex * 100}%)`,
            transition: reducedMotion
              ? "none"
              : "transform 700ms ease-in-out",
          }}
        >
          {activeImages.map((image, index) => (
            <div
              key={image.public_id}
              className="relative h-full min-w-full flex-shrink-0"
            >
              <img
                src={getImageUrl(image, isMobile, isLandscape)}
                alt={image.image_alt ?? `Imagen del banner ${index + 1}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />

              {/* Overlay y texto — solo primera slide */}
              {index === 0 && (
                <>
                  <div className="absolute inset-0 bg-black/35" />

                  <div className="absolute inset-0 flex items-center justify-center px-4 text-center sm:px-6 md:px-8 lg:px-10">
                    <div className="w-full max-w-xs select-none sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
                      <h1
                        className={`font-bold leading-tight tracking-tight text-white ${titleSizeClass}`}
                      >
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

        {/* Controles de navegación */}
        {bolShowControls && (
          <>
            <button
              type="button"
              onClick={goToPreviousImage}
              className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-5 sm:p-3"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={goToNextImage}
              className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-5 sm:p-3"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
              {activeImages.map((image, index) => (
                <button
                  key={image.public_id}
                  type="button"
                  onClick={() => goToSelectedImage(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === intCurrentIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preload de la imagen siguiente — sin warning de preload */}
      {activeImages.map((image, index) => {
        const isNext = index === (intCurrentIndex + 1) % activeImages.length;

        if (!isNext) return null;

        return (
          <link
            key={image.public_id}
            rel="preload"
            as="image"
            href={getImageUrl(image, isMobile, isLandscape)}
          />
        );
      })}
    </section>
  );
}