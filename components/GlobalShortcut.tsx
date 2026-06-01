"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function GlobalShortcut() {
  const router = useRouter();

  useEffect(() => {
    // Guarda las teclas que se presiona
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // COMPROBACIÓN DE SEGURIDAD: Ignorar eventos sin una propiedad 'key' válida
      if (!e.key) return;

      // No se activa si se escribe dentro de un input o textarea
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
        return;
      }

      // Guardamos la tecla presionada en minúsculas
      pressedKeys.add(e.key.toLowerCase());

      // Verifica si Shift, k y l están en la lista de teclas presionadas
      if (
        (pressedKeys.has("shift") || e.shiftKey) &&
        pressedKeys.has("k") &&
        pressedKeys.has("l")
      ) {
        e.preventDefault(); // Evita cualquier comportamiento nativo del navegador
        pressedKeys.clear(); // Limpiamos las teclas para evitar bugs de repetición
        
        //Redirección a verificación-pagos
        router.push("/admin/verificacion-pagos"); 
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // 2. COMPROBACIÓN DE SEGURIDAD: Ignorar eventos sin una propiedad 'key' válida
      if (!e.key) return;
      
      // Cuando se suelta la tecla, se saca de la lista
      pressedKeys.delete(e.key.toLowerCase());
    };

    // Se activa los escuchadores de eventos
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Limpieza al desmontar 
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [router]);

  return null; 
}