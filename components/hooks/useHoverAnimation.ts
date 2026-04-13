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
  cursorType: 'pointer' | 'text' | 'help' | 'not-allowed' | 'grab' | 'zoom-in' = 'pointer',
  isAnimated: boolean = true 
) => {
  // Mapeo explícito para que Tailwind detecte las clases completas
  const cursorClasses = {
    'pointer': 'cursor-pointer',
    'text': 'cursor-text',
    'help': 'cursor-help',
    'not-allowed': 'cursor-not-allowed',
    'grab': 'cursor-grab',
    'zoom-in': 'cursor-zoom-in',
  };

  const strCursorClass = cursorClasses[cursorType];

  // Determinamos si debe escalar: No escalamos en inputs (|) ni en elementos bloqueados (Ø)
  const bolShouldScale = isAnimated && cursorType !== 'text' && cursorType !== 'not-allowed';
  const strScaleClass = bolShouldScale 
    ? "hover:scale-[1.02] md:hover:scale-[1.05] lg:hover:scale-110 active:scale-95" 
    : "";

  // Base de la animación con la clase de cursor estática
  const strTransition = isAnimated ? "transition-all duration-300" : "";
  const strBaseAnimation = `${strTransition} ${strCursorClass} ${strScaleClass}`;
  
  // Resplandor condicional
  const strGlow = includeGlow ? "hover:drop-shadow-[0_0_0.75rem_rgba(194,110,90,0.8)]" : "";
  
  // Color de texto condicional (siguiendo tu estándar oklch del botón secundario)
  const strTextColor = includeColor ? "hover:text-[oklch(0.63_0.11_34)]" : "";

  return `${strBaseAnimation} ${strGlow} ${strTextColor}`.trim();
};