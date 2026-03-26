import { useState, useEffect } from 'react';

/**
 * Dev: Erick Eduardo Arnez Torrico
 * Fecha: 25/03/2026
 * Funcionalidad: Detectar la dirección del scroll de la ventana para ocultar o mostrar componentes interactivos.
 * @return {boolean} Retorna true si el usuario hace scroll hacia abajo (para ocultar), false si hace scroll hacia arriba (para mostrar).
 */
export const useScrollDirection = () => {
  // bolIsHidden determina si el header debe esconderse
  const [bolIsHidden, setBolIsHidden] = useState(false);
  // intLastScrollY guarda la última posición 
  const [intLastScrollY, setIntLastScrollY] = useState(0);

  useEffect(() => {
    // Función que evalúa la posición actual
    const handleScroll = () => {
      const intCurrentScrollY = window.scrollY;

      if (intCurrentScrollY <= 50) {
        setBolIsHidden(false);
      }
      else if (intCurrentScrollY > intLastScrollY && intCurrentScrollY > 50) {
        setBolIsHidden(true);
      } 
      else if (intCurrentScrollY < intLastScrollY) {
        setBolIsHidden(false);
      }

      setIntLastScrollY(intCurrentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [intLastScrollY]);

  return bolIsHidden;
};