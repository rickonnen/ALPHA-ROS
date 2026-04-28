/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 03/04/2026
 * Dev: Oliver                               Fecha: 18/04/2026
 * Hook con protección de estado de carga para evitar ejecuciones sin sesión válida.
 * HU7: Distingue entre límite gratuito y límite de plan activo.
 */
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { verificarEstadoPublicacion } from "@/features/publicacion/modal/action";

interface UsePublicarAccionProps {
  objUser: any;
  onShowProtected: () => void;
  onShowLimit: () => void;
  onShowLimitPlan: () => void;
  onCloseMobileMenu: () => void;
  bolIsAuthLoading?: boolean;
}

export const usePublicarAccion = ({
  objUser,
  onShowProtected,
  onShowLimit,
  onShowLimitPlan,
  onCloseMobileMenu,
  bolIsAuthLoading = false
}: UsePublicarAccionProps) => {
  const [bolIsChecking, setBolIsChecking] = useState(false);
  const objRouter = useRouter();

  const handlePublicar = useCallback(async () => {
    if (bolIsAuthLoading) return;

    if (!objUser) {
      onShowProtected();
      onCloseMobileMenu();
      return;
    }

    setBolIsChecking(true);
    try {
      if (!objUser.id) throw new Error("ID de usuario no disponible");

      const objEstado = await verificarEstadoPublicacion(objUser.id);

      if (objEstado?.bolLimiteAlcanzado) {
        if (objEstado.strTipoLimite === "plan") {
          onShowLimitPlan(); 
        } else {
          onShowLimit();
        }
      } else {
        objRouter.push("/publicacion/formularioPublicacion");
      }
    } catch (error) {
      console.error("Error en validación:", error);
      if (!objUser?.id) {
        onShowProtected();
      } else {
        objRouter.push("/publicacion/formularioPublicacion");
      }
    } finally {
      setBolIsChecking(false);
      onCloseMobileMenu();
    }
  }, [objUser, objRouter, onShowProtected, onShowLimit, onShowLimitPlan, onCloseMobileMenu, bolIsAuthLoading]);

  return { handlePublicar, bolIsChecking };
};