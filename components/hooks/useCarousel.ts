import { useState, useRef, useCallback, useEffect, TouchEvent } from "react";

/**
 * @Dev: Rodrigo Chalco     Fecha: 26/03/2026
 * Funcionalidad: encapsula la lógica de estado, temporizadores, eventos de teclado
 * y gestos táctiles (swipe) para el carrusel de imágenes. Controla la navegación 
 * entre diapositivas, el reinicio del autoplay y la intersección de visibilidad.
 */

interface UseCarouselProps {
  intTotalItems: number;
  intAutoPlayDelay: number;
}

export function useCarousel({ intTotalItems, intAutoPlayDelay }: UseCarouselProps) {
  const [intCurrentIndex, setIntCurrentIndex] = useState<number>(0);
  const [bolIsVisible, setBolIsVisible] = useState<boolean>(true);

  const objBannerRef = useRef<HTMLElement | null>(null);
  const objTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fltTouchStart = useRef<number | null>(null);
  const fltTouchEnd = useRef<number | null>(null);

  const bolShowControls: boolean = intTotalItems > 1;

  const goToNextImage = useCallback((): void => {
    setIntCurrentIndex((intPreviousIndex: number) => {
      if (intPreviousIndex === intTotalItems - 1) return 0;
      return intPreviousIndex + 1;
    });
  }, [intTotalItems]);

  const goToPreviousImage = useCallback((): void => {
    setIntCurrentIndex((intPreviousIndex: number) => {
      if (intPreviousIndex === 0) return intTotalItems - 1;
      return intPreviousIndex - 1;
    });
  }, [intTotalItems]);

  const goToSelectedImage = (intSelectedIndex: number): void => {
    setIntCurrentIndex(intSelectedIndex);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    fltTouchEnd.current = null;
    fltTouchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    fltTouchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!fltTouchStart.current || !fltTouchEnd.current) return;
    
    const distance = fltTouchStart.current - fltTouchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextImage();
    } else if (isRightSwipe) {
      goToPreviousImage();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goToPreviousImage();
      else if (event.key === "ArrowRight") goToNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextImage, goToPreviousImage]);

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

  useEffect(() => {
    if (!bolShowControls || !bolIsVisible) {
      if (objTimerRef.current) clearInterval(objTimerRef.current);
      return;
    }

    objTimerRef.current = setInterval(goToNextImage, intAutoPlayDelay);

    return () => {
      if (objTimerRef.current) clearInterval(objTimerRef.current);
    };
  }, [bolShowControls, bolIsVisible, goToNextImage, intCurrentIndex, intAutoPlayDelay]);

  return {
    intCurrentIndex,
    objBannerRef,
    bolShowControls,
    goToNextImage,
    goToPreviousImage,
    goToSelectedImage,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    }
  };
}