"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @Dev: Rodrigo Chalco
 * @Fecha: 26/03/2026
 * Funcionalidad: Renderiza el banner principal de la página Home con cambio automático
 * de imágenes. El texto principal permanece fijo al centro mientras las imágenes
 * del carrusel cambian de fondo. Incluye controles laterales e indicadores inferiores.
 * @return {React.ReactNode} Componente Banner renderizado
 */
interface BannerImage {
  intId: number;
  strImageUrl: string;
  strAltText: string;
  bolIsActive: boolean;
  intOrder: number;
}

/** Intervalo de autoplay en milisegundos */
const INT_AUTOPLAY_DELAY: number = 5000;

/**
 * URLs hardcodeadas para pruebas mientras la base de datos no está lista.
 * Reemplazar por llamada a Prisma cuando el backend esté listo.
 */
const ARR_BANNER_IMAGES: BannerImage[] = [
  {
    intId: 1,
    strImageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
    strAltText: "Luxury modern house",
    bolIsActive: true,
    intOrder: 0,
  },
  {
    intId: 2,
    strImageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
    strAltText: "House exterior with garden",
    bolIsActive: true,
    intOrder: 1,
  },
  {
    intId: 3,
    strImageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    strAltText: "Premium residential property",
    bolIsActive: true,
    intOrder: 2,
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

  // Define si el carrusel puede avanzar automáticamente
  const bolCanAutoplay: boolean = arrActiveImages.length > 1;

  // Define si se deben mostrar flechas e indicadores
  const bolShowControls: boolean = arrActiveImages.length > 1;

  /**
   * Avanza a la siguiente imagen del carrusel.
   * Si llega al final, vuelve a comenzar desde la primera.
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
   * Retrocede a la imagen anterior del carrusel.
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
   * Cambia el carrusel a una imagen específica según el indicador seleccionado.
   * @param {number} intSelectedIndex Índice de la imagen seleccionada
   * @return {void} No retorna ningún valor
   */
  const goToSelectedImage = (intSelectedIndex: number): void => {
    setIntCurrentIndex(intSelectedIndex);
  };

  /**
   * Observa si el banner sigue visible en pantalla.
   * Cuando deja de ser visible, pausa el autoplay.
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
   * Inicia el temporizador para el cambio automático de imágenes
   * solo cuando existe más de una imagen y el banner está visible.
   */
  useEffect(() => {
    if (!bolCanAutoplay || !bolIsVisible) {
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
  }, [bolCanAutoplay, bolIsVisible, goToNextImage]);

  return (
    <section
      ref={objBannerRef}
      className="relative w-full min-h-[100svh] overflow-hidden font-sans"
      aria-label="Main home banner"
    >
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${intCurrentIndex * 100}%)` }}
      >
        {arrActiveImages.map((objImage: BannerImage) => (
          <div
            key={objImage.intId}
            className="relative min-w-full min-h-[100svh] flex-shrink-0"
          >
            <img
              src={objImage.strImageUrl}
              alt={objImage.strAltText}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-5 text-center sm:px-8 md:px-12">
        <div className="mx-auto flex w-full max-w-[320px] flex-col items-center sm:max-w-2xl md:max-w-4xl">
          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Encuentra el lugar donde
            <br />
            <span className="font-light italic text-amber-200">
              tus sueños
            </span>{" "}
            comienzan
          </h1>

          <p className="mt-4 max-w-[280px] text-xs leading-relaxed text-white/85 sm:mt-5 sm:max-w-xl sm:text-base md:max-w-2xl md:text-lg">
            Miles de propiedades verificadas. Compra, vende o alquila con
            confianza.
          </p>
        </div>
      </div>

      {bolShowControls && (
        <>
          <button
            type="button"
            onClick={goToPreviousImage}
            className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-5 sm:p-3"
            aria-label="Mostrar imagen anterior"
          >
            <span className="text-lg font-bold sm:text-xl">‹</span>
          </button>

          <button
            type="button"
            onClick={goToNextImage}
            className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-5 sm:p-3"
            aria-label="Mostrar siguiente imagen"
          >
            <span className="text-lg font-bold sm:text-xl">›</span>
          </button>
        </>
      )}

      {bolShowControls && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {arrActiveImages.map((objImage: BannerImage, intIndex: number) => (
            <button
              key={objImage.intId}
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
    </section>
  );
}
