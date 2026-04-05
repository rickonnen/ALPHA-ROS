"use client";

import { useRouter }          from "next/navigation";
import { useState }           from "react";
import { Button }             from "@/components/ui/button";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";
import { verificarEstadoPublicacion } from "@/features/publicacion/modal/action";
import { useAuth }            from "@/app/auth/AuthContext"; // ← ajustá la ruta según tu estructura

export const PropertyActions = () => {
  const router = useRouter();
  const { user } = useAuth(); // ← reemplaza el localStorage
  const [bolShowModal, setBolShowModal] = useState(false);
  const [bolChecking,  setBolChecking]  = useState(false);

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
      console.log("objEstado:", objEstado);
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
        router.push("/publicacion/informacion-comercial");
      }
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

      <FreePublicationLimitModal
        bolOpen={bolShowModal}
        onBack={() => setBolShowModal(false)}
      />
    </>
  );
};