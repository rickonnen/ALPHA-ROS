/**
 * Dev: Gustavo Montaño
 * Date: 28/03/2026
 * Funcionalidad: Botones de acción del perfil del inmueble (HU4 - Task 4.10)
 * @return JSX con botones "Ver mis publicaciones" y "Publicar otro inmueble"
 */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const PropertyActions = () => {
  const router = useRouter();
  return (
    <footer className="flex flex-row justify-between items-center gap-3 pt-10 border-t border-black/10">
      <Button
        type="button"
        variant="outline"
        className="flex-1 md:flex-none min-w-0 border-[#C26E5A] text-[#C26E5A] px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs md:text-lg hover:bg-[#C26E5A]/5"
        onClick={() => router.push("/perfil")}
      >
        Ver mis publicaciones
      </Button>
      <Button
        type="button"
        className="flex-1 md:flex-none min-w-0 bg-[#C26E5A] text-white px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs md:text-lg hover:bg-[#C26E5A]/90 transition-colors"
        onClick={() => router.push("/publicacion/informacion-comercial")}
      >
        Publicar otro inmueble
      </Button>
    </footer>
  );
};