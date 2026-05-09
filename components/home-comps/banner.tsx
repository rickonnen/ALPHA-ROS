"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * @Dev: Rodrigo Chalco
 * @Fecha: 26/03/2026
 * Funcionalidad: Renderiza el banner principal del Home con imágenes cargadas
 * desde Cloudinary. El texto se muestra solo en la primera imagen del carrusel.
 * El banner ocupa aproximadamente 3/4 de la vista para dejar espacio al filtro.
 * @return {React.ReactNode} Componente Banner renderizado
 */
interface BannerImage {
  intId: number;
  strImageUrl: string;
  strPublicId: string;
  bolIsActive: boolean;
  intOrder: number;
}

/** Intervalo de autoplay en milisegundos */
const INT_AUTOPLAY_DELAY: number = 5000;

/**
 * Imágenes del banner obtenidas desde Cloudinary.
 * Reemplazar por las URLs reales del proyecto.
 */
const ARR_BANNER_IMAGES: BannerImage[] = [
  {
    intId: 1,
    strImageUrl:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774558931/pexels-binyaminmellish-1396122_i3p4d2.jpg",
    strPublicId: "banner_inicio/casa1",
    bolIsActive: true,
    intOrder: 1,
  },
  {
    intId: 2,
    strImageUrl:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774560131/todd-kent-178j8tJrNlc-unsplash_mocaei.jpg",
    strPublicId: "banner_inicio/casa2",
    bolIsActive: true,
    intOrder: 2,
  },
  {
    intId: 3,
    strImageUrl:
      "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774560110/clay-banks-kiv1ggvkgQk-unsplash_sqpwkb.jpg",
    strPublicId: "banner_inicio/casa3",
    bolIsActive: true,
    intOrder: 3,
  },
];

export default function Banner() {
  const [intCurrentIndex, setIntCurrentIndex] = useState<number>(0);
  const [bolIsVisible, setBolIsVisible] = useState<boolean>(true);

  const objBannerRef = useRef<HTMLElement | null>(null);
  const objTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filtra las imágenes activas y las ordena por posición
  const arrActiveImages: BannerImage[] = ARR_BANNER_IMAGES.filter(
    (objImage: BannerImage) => objImage.bolIsActive,
  ).sort(
    (objFirstImage: BannerImage, objSecondImage: BannerImage) =>
      objFirstImage.intOrder - objSecondImage.intOrder,
  );

  // Define si se deben mostrar flechas e indicadores
  const bolShowControls: boolean = arrActiveImages.length > 1;

  /**
   * Avanza el carrusel a la siguiente imagen.
   * Si llega a la última, vuelve a la primera.
   * @return {void} No retorna ningún valor
   */
  const goToNextImage = useCallback((): void => {
    setIntCurrentIndex((intPreviousIndex: number) => {
      if (intPreviousIndex === arrActiveImages.length - 1) {
        return 0;
      }

      return intPreviousIndex + 1;
    });
  }, [arrActiveImages.length]);

  /**
   * Retrocede el carrusel a la imagen anterior.
   * Si está en la primera, salta a la última.
   * @return {void} No retorna ningún valor
   */
  const goToPreviousImage = useCallback((): void => {
    setIntCurrentIndex((intPreviousIndex: number) => {
      if (intPreviousIndex === 0) {
        return arrActiveImages.length - 1;
      }

      return intPreviousIndex - 1;
    });
  }, [arrActiveImages.length]);

  /**
   * Navega directamente hacia una imagen específica.
   * @param {number} intSelectedIndex Índice de la imagen seleccionada
   * @return {void} No retorna ningún valor
   */
  const goToSelectedImage = (intSelectedIndex: number): void => {
    setIntCurrentIndex(intSelectedIndex);
  };

  /**
   * Observa la visibilidad del banner para pausar el autoplay
   * cuando el usuario ya no lo tiene en pantalla.
   */
  useEffect(() => {
    const objObserver: IntersectionObserver = new IntersectionObserver(
      ([objEntry]: IntersectionObserverEntry[]) => {
        setBolIsVisible(objEntry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (objBannerRef.current) {
      objObserver.observe(objBannerRef.current);
    }

    return () => {
      objObserver.disconnect();
    };
  }, []);

  /**
   * Inicia o pausa el temporizador automático del carrusel
   * según cantidad de imágenes y visibilidad del banner.
   */
  useEffect(() => {
    if (!bolShowControls || !bolIsVisible) {
      if (objTimerRef.current) {
        clearInterval(objTimerRef.current);
      }

      return;
    }

    objTimerRef.current = setInterval(goToNextImage, INT_AUTOPLAY_DELAY);

    return () => {
      if (objTimerRef.current) {
        clearInterval(objTimerRef.current);
      }
    };
  }, [bolShowControls, bolIsVisible, goToNextImage]);

  // Protege el render si no existen imágenes activas
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
      <div className="relative h-[63svh] sm:h-[66svh] md:h-[68svh] lg:h-[70svh] xl:h-[73svh] overflow-hidden">
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
                src={objImage.strImageUrl}
                alt={`Banner ${intIndex + 1}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-black/35" />

              {/* El texto pertenece solo a la primera imagen */}
              {intIndex === 0 && (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center sm:px-6 md:px-8 lg:px-10">
                  <div className="max-w-[320px] sm:max-w-2xl lg:max-w-4xl">
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
          </>
        )}

        {bolShowControls && (
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
        )}
      </div>
    </section>
  );
}
