/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 02/04/2026
 * Hook para centralizar la animación de crecimiento, resplandor y cursor.
 * Devuelve la cadena de clases de Tailwind para ser aplicada a cualquier componente.
 */
export const useHoverAnimation = (type: "desktop" | "mobile" = "desktop") => {
  const baseAnimation = "transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer";
  const glowAndColor = "hover:text-[oklch(0.63_0.11_34)] hover:drop-shadow-[0_0_12px_rgba(194,110,90,0.8)]";

  return `${baseAnimation} ${glowAndColor}`;
};