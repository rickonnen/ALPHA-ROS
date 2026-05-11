/**
 * @Dev: Gustavo Montaño
 * @Fecha: 09/05/2026
 * @Funcionalidad: Componente cliente invisible (Client Component) encargado de ejecutar 
 * un fetch a la API para registrar una vista. Utiliza useRef para asegurar 
 * que solo se envíe una petición por renderizado.
 * @param {number} id_publicacion - ID del inmueble que está siendo visualizado.
 * @return {null} No renderiza ningún elemento en el DOM.
 */
"use client";
import { useEffect, useRef } from "react";
export const ViewTracker = ({ id_publicacion }: { id_publicacion: number }) => {
  // Usamos useRef para garantizar que la vista se registre SOLO UNA VEZ por visita,
  // incluso si React hace re-renders rápidos (muy común en modo estricto).
  const hasTracked = useRef(false);
  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      // Llamamos a nuestra API 
      fetch(`/api/publicacion/${id_publicacion}/vista`, {
        method: "POST",
      }).catch((error) => console.error("Error al registrar vista:", error));
    }
  }, [id_publicacion]);
  return null; // Este componente es 100% invisible en la pantalla
};