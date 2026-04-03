/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 02/04/2026
 * Hook para centralizar la animación de crecimiento, resplandor y cursor.
 * Ahora permite desactivar el cambio de color de texto manteniendo el resplandor.
 */
export const useHoverAnimation = (includeColor: boolean = true) => {
  const baseAnimation = "transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer";
  
  // Mantenemos el resplandor (drop-shadow), pero el color de texto es condicional
  const glow = "hover:drop-shadow-[0_0_12px_rgba(194,110,90,0.8)]";
  const textColor = includeColor ? "hover:text-[oklch(0.63_0.11_34)]" : "";

  return `${baseAnimation} ${glow} ${textColor}`;
};