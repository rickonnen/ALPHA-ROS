"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import  FreePublicationLimitModal  from "@/app/frontend/publicacion/components/FreePublicationLimitModal";

export const PropertyActions = () => {
  const router = useRouter();
  const [bolShowModal, setBolShowModal] = useState(false);

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
          className="flex-1 md:flex-none min-w-0 bg-[#C26E5A] text-white px-3 md:px-12 py-4 md:py-7 rounded-lg font-bold text-xs! md:text-lg! hover:bg-[#C26E5A]/90 transition-colors"
          onClick={() => setBolShowModal(true)}
        >
          Publicar otro inmueble
        </Button>
      </footer>

      {/* Modal de límite de publicaciones */}
      {bolShowModal && (
        <FreePublicationLimitModal
  intPublicationCount={bolShowModal ? 0 : 2}
  bolIsPremium={true}
  onBack={() => setBolShowModal(false)}
/>
      )}
    </>
  );
};