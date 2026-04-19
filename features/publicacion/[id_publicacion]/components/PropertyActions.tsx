/**
 * Dev: Gustavo Montaño
 * Date: 17/04/2026
 * Funcionalidad: Footer con acciones para ver el historial de publicaciones o crear una nueva. Valida el estado de la suscripción/límite de publicaciones del usuario y limpia las variables de sessionStorage (borradores) antes de iniciar un nuevo registro.
 * @param router - Hook de Next.js para la navegación hacia el perfil o el formulario de publicación
 * @param user - Objeto del contexto de autenticación con los datos del usuario activo
 * @param bolShowModal - Estado booleano que controla la apertura del modal de advertencia de límite alcanzado
 * @param bolChecking - Estado booleano que muestra el estado de carga y deshabilita el botón de publicación durante la verificación
 * @return JSX con los botones responsivos de acción y el componente FreePublicationLimitModal
 */
"use client";

import { useRouter }          from "next/navigation";
import { useState }           from "react";
import { Button }             from "@/components/ui/button";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";
import PlanLimitModal            from "@/features/publicacion/components/PlanLimitModal";
import { verificarEstadoPublicacion } from "@/features/publicacion/modal/action";
import { useAuth }            from "@/app/auth/AuthContext";

export const PropertyActions = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [bolChecking,          setBolChecking]          = useState(false);
  const [bolShowModalGratuito, setBolShowModalGratuito] = useState(false); // HU5
  const [bolShowModalPlan,     setBolShowModalPlan]     = useState(false); // HU7

  const handleVerMisPublicaciones = () => {
    if (!user) {
      router.push("/perfil");
      return;
    }
    router.push(`/perfil?id=${user.id}&view=publicaciones`);
  };

  const handleNuevaPublicacion = async () => {
    if (!user) {
      router.push("/publicacion/informacion-comercial");
      return;
    }

    setBolChecking(true);
    try {
      const objEstado = await verificarEstadoPublicacion(user.id);

      if (objEstado.bolLimiteAlcanzado) {
        // Decide qué modal mostrar según el tipo de límite
        if (objEstado.strTipoLimite === "plan") {
          setBolShowModalPlan(true);      // HU7 — plan activo excedido
        } else {
          setBolShowModalGratuito(true);  // HU5 — gratuito excedido
        }
        return;
      }

      // Sin límite → limpiar session y navegar
      sessionStorage.removeItem("caracteristicasInmueble");
      sessionStorage.removeItem("caracteristicasInmuebleUsuario");
      sessionStorage.removeItem("informacionComercialDraft");
      sessionStorage.removeItem("informacionComercialDraftUsuario");
      sessionStorage.removeItem("informacionComercial");
      sessionStorage.removeItem("videoUrl");
      sessionStorage.removeItem("imageUploader_userInteracted");
      router.push("/publicacion/informacion-comercial");

    } catch (error) {
      console.error("Error verificando publicaciones:", error);
      router.push("/publicacion/informacion-comercial");
    } finally {
      setBolChecking(false);
    }
  };

  return (
    <>
      <footer className="flex flex-row justify-between items-center gap-3 pt-10 border-t border-black/10">
        <Button
          type="button"
          variant="outline"
          className="flex-1 md:flex-none min-w-0 border-[#C26E5A] text-[#C26E5A] px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs! md:text-lg! hover:bg-[#C26E5A]/5"
          onClick={handleVerMisPublicaciones}
        >
          Ver mis publicaciones
        </Button>

        <Button
          type="button"
          disabled={bolChecking}
          className="flex-1 md:flex-none min-w-0 bg-[#C26E5A] text-white px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs! md:text-lg! hover:bg-[#C26E5A]/90 transition-colors disabled:opacity-60"
          onClick={handleNuevaPublicacion}
        >
          {bolChecking ? "Verificando..." : "Publicar otro inmueble"}
        </Button>
      </footer>

      {/* HU5 — Modal plan gratuito (sin cambios) */}
      <FreePublicationLimitModal
        bolOpen={bolShowModalGratuito}
        onBack={() => setBolShowModalGratuito(false)}
      />

      {/* HU7 — Modal plan activo excedido (nuevo) */}
      <PlanLimitModal
        bolOpen={bolShowModalPlan}
        onBack={() => setBolShowModalPlan(false)}
      />
    </>
  );
};