import { useEffect, RefObject } from "react";
/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 02/04/2026
 * Hook para detectar clics fuera de uno o varios elementos
 * @param refs Array de referencias a los elementos que NO deben activar el cierre
 * @param handler Función a ejecutar cuando se hace clic fuera
 * @param enabled Si el detector debe estar activo o no
 */
export const useClickOutside = (
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      const clickedInside = refs.some(ref => ref.current?.contains(target));
      
      if (!clickedInside) {
        handler();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [refs, handler, enabled]);
};