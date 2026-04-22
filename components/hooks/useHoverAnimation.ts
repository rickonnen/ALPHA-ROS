/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 03/04/2026
 * Hook para centralizar la animación
 * como utilizar:
 * Color: sí, Glow: sí, Cursor: pointer, Animación Suave: sí, Escala: NO
 * const miEfectoNuevo = useHoverAnimation(true, true, 'pointer', true, false);
 */
export const useHoverAnimation = (
  includeColor: boolean = true, 
  includeGlow: boolean = true, 
  cursorType: 'pointer' | 'text' | 'help' | 'not-allowed' | 'grab' | 'zoom-in' = 'pointer',
  isAnimated: boolean = true,  
  includeScale: boolean = true 
) => {
  const cursorClasses = {
    'pointer': 'cursor-pointer',
    'text': 'cursor-text',
    'help': 'cursor-help',
    'not-allowed': 'cursor-not-allowed',
    'grab': 'cursor-grab',
    'zoom-in': 'cursor-zoom-in',
  };

  const strCursorClass = cursorClasses[cursorType];

  const bolShouldScale = includeScale && isAnimated && cursorType !== 'text' && cursorType !== 'not-allowed';
  const strScaleClass = bolShouldScale 
    ? "hover:scale-[1.02] md:hover:scale-[1.05] lg:hover:scale-110 active:scale-95 data-[active=true]:scale-[1.02] md:data-[active=true]:scale-[1.05] lg:data-[active=true]:scale-110" 
    : "";

  const strTransition = isAnimated ? "transition-all duration-300" : "";
  const strBaseAnimation = `${strTransition} ${strCursorClass} ${strScaleClass}`;
  
  // Resplandor: Se activa con el ratón O con el teclado
  const strGlow = includeGlow ? "hover:drop-shadow-[0_0_0.75rem_rgba(194,110,90,0.8)] data-[active=true]:drop-shadow-[0_0_0.75rem_rgba(194,110,90,0.8)]" : "";
  
  // Color de texto: Se activa con el ratón O con el teclado
  const strTextColor = includeColor ? "hover:text-[oklch(0.63_0.11_34)] data-[active=true]:text-[oklch(0.63_0.11_34)]" : "";

  return `${strBaseAnimation} ${strGlow} ${strTextColor}`.trim();
};