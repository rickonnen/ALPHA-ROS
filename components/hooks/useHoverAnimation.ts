/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 03/04/2026
 * Hook para centralizar la animación de crecimiento, resplandor y cursor.
 * Ahora permite desactivar el cambio de color de texto manteniendo el resplandor.
 * Permite activar/desactivar el resplandor y el cambio de color de forma independiente.
 * Soporta cambio de cursor para campos de texto (I-beam) y desactiva escala en esos casos.
 */
export const useHoverAnimation = (
  includeColor: boolean = true, 
  includeGlow: boolean = true, 
  cursorType: 'pointer' | 'text' | 'help' | 'not-allowed' | 'grab' | 'zoom-in' = 'pointer'
) => {
  // Determinamos si debe escalar: No escalamos en inputs (|) ni en elementos bloqueados (Ø)
  const shouldScale = cursorType !== 'text' && cursorType !== 'not-allowed';
  const scaleClass = shouldScale ? "hover:scale-110 active:scale-95" : "";

  // si es input, el cursor es "text" (|) y no escalamos. Si no, es "pointer" con escala.
  const baseAnimation = `transition-all duration-300 cursor-${cursorType} ${scaleClass}`;
  
  // resplandor condicional
  const glow = includeGlow ? "hover:drop-shadow-[0_0_12px_rgba(194,110,90,0.8)]" : "";
  
  // color de texto condicional
  const textColor = includeColor ? "hover:text-[oklch(0.63_0.11_34)]" : "";

  return `${baseAnimation} ${glow} ${textColor}`.trim();
};