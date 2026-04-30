"use client";

/**
 * @Dev: jimmyP
 * @Fecha: 29/03/2026
 * @Funcionalidad: Modal HU5. Se muestra cuando el usuario gratuito
 * ha agotado sus 2 publicaciones gratuitas.
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

interface FreePublicationLimitModalProps {
  bolOpen: boolean;
  onBack: () => void;
  strPlansHref?: string;
  strTitle?: string;
  strDescription?: string;
}

export default function FreePublicationLimitModal({
  bolOpen,
  onBack,
  strPlansHref = "/cobros/planes",
  strTitle = "Has excedido tus publicaciones gratuitas",
  strDescription = "Tu plan gratuito te concede 2 publicaciones gratuitas, cambia a un plan de pago para hacer más publicaciones",
}: FreePublicationLimitModalProps) {

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
            {strTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base text-[#2E2E2E]/70 text-center leading-relaxed">
            {strDescription}
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