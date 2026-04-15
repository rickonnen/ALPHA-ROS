/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 03/04/2026
 * Hook con protección de estado de carga para evitar ejecuciones sin sesión válida.
 */
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { verificarEstadoPublicacion } from "@/features/publicacion/modal/action";

interface UsePublicarAccionProps {
  objUser: any;
  onShowProtected: () => void;
  onShowLimit: () => void;
  onCloseMobileMenu: () => void;
  bolIsAuthLoading?: boolean;
}

export const usePublicarAccion = ({
  objUser,
  onShowProtected,
  onShowLimit,
  onCloseMobileMenu,
  bolIsAuthLoading = false
}: UsePublicarAccionProps) => {
  const [bolIsChecking, setBolIsChecking] = useState(false);
  const objRouter = useRouter();

  const handlePublicar = useCallback(async () => {
    // si la autenticación aún está cargando, no hacemos nada
    if (bolIsAuthLoading) return;

    // si definitivamente no hay usuario tras cargar, mostramos modal
    if (!objUser) {
      onShowProtected();
      onCloseMobileMenu();
      return;
    }

    setBolIsChecking(true);
    try {
      // verificación de seguridad: si objUser existe pero no tiene ID, abortamos
      if (!objUser.id) throw new Error("ID de usuario no disponible");

      const objEstado = await verificarEstadoPublicacion(objUser.id);
      
      if (objEstado?.bolLimiteAlcanzado) {
        onShowLimit();
      } else {
        objRouter.push("/publicacion/informacion-comercial");
      }
    } catch (error) {
      console.error("Error en validación:", error);
      // si falla la API o el JSON, mandamos a login por seguridad si no hay ID
      if (!objUser?.id) {
        onShowProtected();
      } else {
        objRouter.push("/publicacion/informacion-comercial");
      }
    } finally {
      setBolIsChecking(false);
      onCloseMobileMenu();
    }
  }, [objUser, objRouter, onShowProtected, onShowLimit, onCloseMobileMenu, bolIsAuthLoading]);

  return { handlePublicar, bolIsChecking };
};