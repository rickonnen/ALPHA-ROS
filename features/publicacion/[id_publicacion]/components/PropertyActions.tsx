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
/**
 * Dev: Gustavo Montaño
 * Fecha: 25/04/2026
 * Update: Fix Corrección de ruta (/publicacion/formularioPublicacion) y limpieza estricta de sessionStorage.
 * Funcionalidad: Footer de acciones para ver historial o publicar nuevo inmueble validando límites.
 * @param {void} No recibe parámetros (usa contexto de autenticación).
 * @return {JSX.Element} Botones responsivos y modales de límites.
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
      // FIX: Ruta correcta del nuevo formulario dinámico
      router.push("/publicacion/formularioPublicacion");
      return;
    }

    setBolChecking(true);
    try {
      const objEstado = await verificarEstadoPublicacion(user.id);

      if (objEstado.bolLimiteAlcanzado) {
        if (objEstado.strTipoLimite === "plan") {
          setBolShowModalPlan(true);      // HU7 — plan activo excedido
        } else {
          setBolShowModalGratuito(true);  // HU5 — gratuito excedido
        }
        return;
      }

      // FIX: Limpiar exactamente las variables que usa el Formulario Dinámico
      const KEYS_TO_CLEAN = [
        'publicacion_currentStep', 
        'publicacion_completedSteps', 
        'datosAviso', 
        'categoriaYEstado', 
        'ubicacion', 
        'caracteristicasDetalle', 
        'imagenesPropiedad_interacted', 
        'caracteristicasImagenesPreview', 
        'caracteristicasImagenesNombres', 
        'videoPropiedad', 
        'descripcionPropiedad', 
        'imagenesIniciales'
      ];
      
      KEYS_TO_CLEAN.forEach(k => { 
        try { sessionStorage.removeItem(k) } catch { } 
      });

      // FIX: Redirigir a la ruta correcta del nuevo formulario sin 404
      router.push("/publicacion/formularioPublicacion");

    } catch (error) {
      console.error("Error verificando publicaciones:", error);
      router.push("/publicacion/formularioPublicacion");
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

      {/* HU7 — Modal plan activo excedido */}
      <PlanLimitModal
        bolOpen={bolShowModalPlan}
        onBack={() => setBolShowModalPlan(false)}
      />
    </>
  );
};