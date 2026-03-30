"use client";

/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Modificación: StefanyS — 29/03/2026
 * @Funcionalidad: Botones de acción en la página de detalle del inmueble.
 *                 Al hacer click en "Publicar otro inmueble" consulta el contador
 *                 del usuario. El modal solo se abre si bolShowModal=true,
 *                 nunca al montar el componente.
 * @param {PropertyActionsProps} props - ID del usuario dueño de la publicación.
 * @return {JSX.Element} Footer con botones y modal controlado.
 */

import { useRouter }             from "next/navigation";
import { useState }              from "react";
import { Button }                from "@/components/ui/button";
import FreePublicationLimitModal from "@/app/frontend/publicacion/components/FreePublicationLimitModal";
import { verificarEstadoPublicacion } from "@/app/backend/publicacion/modal/action";

// PascalCase para la interfaz - Estándar Alpha-Ros
interface PropertyActionsProps {
  strUserId: string;
}

export const PropertyActions = ({ strUserId }: PropertyActionsProps) => {
  const router = useRouter();
  // Inicia en false — el modal NUNCA se abre solo al montar
  const [bolShowModal, setBolShowModal] = useState(false);
  const [bolChecking,  setBolChecking]  = useState(false);

  /**
   * @Dev: StefanyS
   * @Fecha: 29/03/2026
   * @Funcionalidad: Verifica el contador SOLO al hacer click.
   *                 Nunca modifica bolShowModal al montar o al renderizar.
   * @return {Promise<void>}
   */
  const handleNuevaPublicacion = async () => {
    setBolChecking(true);
    try {
      const objEstado = await verificarEstadoPublicacion(strUserId);
      if (objEstado.bolLimiteAlcanzado) {
        // Solo aquí se abre el modal — después de verificar con un click real
        setBolShowModal(true);
      } else {
        router.push("/frontend/publicacion/informacion-comercial");
      }
    } catch {
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
          onClick={() => router.push("/frontend/perfil")}
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

      {/* Modal — siempre en el DOM pero solo visible cuando bolShowModal=true */}
      <FreePublicationLimitModal
        bolOpen={bolShowModal}
        onBack={() => setBolShowModal(false)}
      />
    </>
  );
};