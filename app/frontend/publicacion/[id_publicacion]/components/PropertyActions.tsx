"use client";

/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Modificación: StefanyS — 29/03/2026
 * @Funcionalidad: Botones de acción en la página de detalle del inmueble.
 *                 Al hacer click en "Publicar otro inmueble" consulta el contador
 *                 del usuario en ese momento.
 *                 Si cant_publicaciones_restantes > 0 → redirige al formulario.
 *                 Si cant_publicaciones_restantes = 0 → muestra el modal (HU5).
 * @param {PropertyActionsProps} props - ID del usuario dueño de la publicación.
 * @return {JSX.Element} Footer con botones y modal condicional.
 */

import { useRouter }             from "next/navigation";
import { useState }              from "react";
import { Button }                from "@/components/ui/button";
import FreePublicationLimitModal from "@/app/frontend/publicacion/components/FreePublicationLimitModal";
import { verificarEstadoPublicacion } from "@/app/backend/publicacion/action";

// PascalCase para la interfaz - Estándar Alpha-Ros
interface PropertyActionsProps {
  strUserId: string;
}

export const PropertyActions = ({ strUserId }: PropertyActionsProps) => {
  const router = useRouter();
  // Controla si el modal es visible
  const [bolShowModal, setBolShowModal] = useState(false);
  // Controla el estado de carga mientras se consulta la BD
  const [bolChecking,  setBolChecking]  = useState(false);

  /**
   * @Dev: StefanyS
   * @Fecha: 29/03/2026
   * @Funcionalidad: Verifica el contador de publicaciones restantes al hacer click.
   *                 cant_publicaciones_restantes > 0 → redirige al formulario.
   *                 cant_publicaciones_restantes = 0 → abre el modal.
   * @return {Promise<void>}
   */
  const handleNuevaPublicacion = async () => {
    setBolChecking(true);
    try {
      const objEstado = await verificarEstadoPublicacion(strUserId);

      if (objEstado.bolLimiteAlcanzado) {
        // Contador en 0 → mostrar modal de límite alcanzado
        setBolShowModal(true);
      } else {
        // Contador mayor a 0 → redirigir al formulario de publicación
        router.push("/frontend/publicacion/informacion-comercial");
      }
    } catch {
      // Error de red o BD → redirigir para no bloquear al usuario
      router.push("/frontend/publicacion/informacion-comercial");
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
          onClick={() => router.push("/perfil")}
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

      {/* Modal solo se monta cuando bolShowModal es true */}
      {bolShowModal && (
        <FreePublicationLimitModal
          onBack={() => setBolShowModal(false)}
        />
      )}
    </>
  );
};