"use client";
/**
 * @Dev: Gustavo Montaño
 * @Fecha: 30/03/2026
 * @Funcionalidad: Botones de acción en la página de detalle del inmueble.
 * Al hacer click en "Publicar otro inmueble" consulta el contador
 * del usuario. El modal solo se abre si bolShowModal=true,
 * nunca al montar el componente.
 * @return {JSX.Element} Footer con botones y modal controlado.
 */

import { useRouter }          from "next/navigation";
import { useState, useEffect }from "react";
import { Button }             from "@/components/ui/button";
import FreePublicationLimitModal from "@/app/frontend/publicacion/components/FreePublicationLimitModal";
import { verificarEstadoPublicacion } from "@/app/backend/publicacion/modal/action";

export const PropertyActions = () => {
  const router = useRouter();
  const [bolShowModal, setBolShowModal] = useState(false);
  const [bolChecking,  setBolChecking]  = useState(false);
  const [strUserId,    setStrUserId]    = useState("");

  // Obtener el usuario desde localStorage igual que AuthContext
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const objUser = JSON.parse(storedUser);
      setStrUserId(objUser.id ?? "");
    }
  }, []);

  // 🚀 FUNCIÓN PARA IR AL PERFIL DIRECTO A LA PESTAÑA "PUBLICACIONES"
  const handleVerMisPublicaciones = () => {
    if (!strUserId) {
      router.push("/frontend/auth/sing-in-up"); 
      return;
    }
    
    // Mandamos el ID del usuario Y el parámetro 'view=publicaciones' para que
    // el equipo de Perfil sepa qué pestaña abrir directamente.
    router.push(`/frontend/perfil?id=${strUserId}&view=publicaciones`);
  };

  // 🚀 FUNCIÓN PARA PUBLICAR VERIFICANDO CRÉDITOS
  const handleNuevaPublicacion = async () => {
    if (!strUserId) {
      router.push("/frontend/auth/sing-in-up");
      return;
    }
    setBolChecking(true);
    try {
      const objEstado = await verificarEstadoPublicacion(strUserId);
      if (objEstado.bolLimiteAlcanzado) {
        setBolShowModal(true);
      } else {
        sessionStorage.removeItem("caracteristicasInmueble");
        sessionStorage.removeItem("caracteristicasInmuebleUsuario");
        sessionStorage.removeItem("informacionComercialDraft");
        sessionStorage.removeItem("informacionComercialDraftUsuario");
        sessionStorage.removeItem("informacionComercial");
        sessionStorage.removeItem("videoUrl");
        sessionStorage.removeItem("imageUploader_userInteracted");
        router.push("/frontend/publicacion/informacion-comercial");
      }
    } catch {
      sessionStorage.removeItem("caracteristicasInmueble");
        sessionStorage.removeItem("caracteristicasInmuebleUsuario");
        sessionStorage.removeItem("informacionComercialDraft");
        sessionStorage.removeItem("informacionComercialDraftUsuario");
        sessionStorage.removeItem("informacionComercial");
        sessionStorage.removeItem("videoUrl");
        sessionStorage.removeItem("imageUploader_userInteracted");
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

      <FreePublicationLimitModal
        bolOpen={bolShowModal}
        onBack={() => setBolShowModal(false)}
      />
    </>
  );
};