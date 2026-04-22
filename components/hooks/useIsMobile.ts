import { useEffect, useState } from "react";

/**
 * Detecta si el dispositivo es mobile según el breakpoint md de Tailwind (768px).
 * Se actualiza automáticamente si el usuario redimensiona la ventana.
 */
export function useIsMobile(): boolean {
  const [bolIsMobile, setBolIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const objMediaQuery = window.matchMedia("(max-width: 768px)");

    setBolIsMobile(objMediaQuery.matches);

    const handleChange = (objEvent: MediaQueryListEvent): void => {
      setBolIsMobile(objEvent.matches);
    };

    objMediaQuery.addEventListener("change", handleChange);

    return () => {
      objMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return bolIsMobile;
}