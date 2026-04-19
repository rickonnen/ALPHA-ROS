"use client";

/**
 * @Dev: jimmyP / Oliver
 * @Fecha: 18/04/2026
 * @Funcionalidad: Modal HU7. Se muestra cuando el usuario con plan activo
 * ha agotado el límite de publicaciones permitidas por su plan.
 */

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlanLimitModalProps {
  bolOpen: boolean;
  onBack: () => void;
  strPlansHref?: string;
}

export default function PlanLimitModal({
  bolOpen,
  onBack,
  strPlansHref = "/cobros/planes",
}: PlanLimitModalProps) {

  const router = useRouter();

  if (!bolOpen) return null;

  return (
    <AlertDialog open={bolOpen}>
      <AlertDialogContent
        className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-8 bg-white"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <AlertDialogHeader className="text-center space-y-3">
          <AlertDialogTitle className="text-2xl sm:text-3xl font-bold text-center leading-tight">
            Límite de publicaciones alcanzado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base text-[#2E2E2E]/70 text-center leading-relaxed">
            Has utilizado la cantidad de publicaciones incluidas en tu plan
            actual. Para seguir publicando, mejora tu suscripción o adquiere
            un paquete adicional.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-between gap-3 sm:gap-4 bg-transparent border-none">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 hover:text-[#C26E5A] font-semibold cursor-pointer"
          >
            {"< Atrás"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 hover:text-[#C26E5A] font-semibold cursor-pointer"
            onClick={() => {
              onBack();
              router.push(strPlansHref);
            }}
          >
            {"Ver Planes →"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}