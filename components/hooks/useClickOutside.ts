import { useEffect, RefObject } from "react";
/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 02/04/2026
 * Hook para detectar interacciones (clics/toques) fuera de uno o varios elementos
 * @param refs Array de referencias a los elementos que NO deben activar el cierre
 * @param handler Función a ejecutar cuando se interactúa fuera o se presiona Escape
 * @param enabled Si el detector debe estar activo o no (por defecto: true)
 */
interface InteractionOptions {
  enabled?: boolean;
  lockScroll?: boolean;
}

export const useClickOutside = (
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  options: InteractionOptions = { enabled: true, lockScroll: false }
) => {
  const { enabled = true, lockScroll = false } = options;

  useEffect(() => {
    if (!enabled) return;

    let originalOverflow = "";
    if (lockScroll) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    const handleInteractionOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const interactedInside = refs.some(ref => ref.current?.contains(target));
      
      if (!interactedInside) {
        handler();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    };

    document.addEventListener("mousedown", handleInteractionOutside);
    document.addEventListener("touchstart", handleInteractionOutside, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      if (lockScroll) {
        document.body.style.overflow = originalOverflow;
      }
      document.removeEventListener("mousedown", handleInteractionOutside);
      document.removeEventListener("touchstart", handleInteractionOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [refs, handler, enabled, lockScroll]);
};