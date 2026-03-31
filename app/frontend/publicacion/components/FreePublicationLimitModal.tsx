"use client";

/**
 * @Dev: Gustavo Montaño
 * @Fecha: 28/03/2026
 * @Modificación: StefanyS — 29/03/2026
 * @Funcionalidad: Modal de la HU5. Controlado externamente por bolOpen.
 *                 Solo se muestra cuando PropertyActions confirma límite alcanzado
 *                 y activa bolOpen=true. Nunca se abre solo al montar.
 * @param {FreePublicationLimitModalProps} props - Callback, estado y textos del modal.
 * @return {JSX.Element | null} AlertDialog controlado o null si bolOpen es false.
 */

import Link       from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// PascalCase para la interfaz - Estándar Alpha-Ros
interface FreePublicationLimitModalProps {
  bolOpen:         boolean;   // controla si el modal está visible
  onBack:          () => void;
  strPlansHref?:   string;
  strTitle?:       string;
  strDescription?: string;
}

export default function FreePublicationLimitModal({
  bolOpen,
  onBack,
  strPlansHref   = "/frontend/cobros/planes",
  strTitle       = "Has excedido tus publicaciones gratuitas",
  strDescription = "Tu plan gratuito te concede 2 publicaciones gratuitas, cambia a un plan de pago para hacer más publicaciones",
}: FreePublicationLimitModalProps) {

  // No renderizar nada si el modal está cerrado
  if (!bolOpen) return null;

  return (
    <AlertDialog open={bolOpen}>
      <AlertDialogContent
        className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-8"
        style={{ fontFamily: 'var(--font-geist-sans)' }}
      >
        <AlertDialogHeader className="text-center space-y-3">
          <AlertDialogTitle className="text-2xl sm:text-3xl font-bold text-center leading-tight">
            {strTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base text-[#2E2E2E]/70 text-center leading-relaxed">
            {strDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Botón Atrás */}
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="flex-1 text-[#C26E5A] hover:text-[#C26E5A] hover:bg-[#C26E5A]/10 font-semibold"
          >
            {"< Atrás"}
          </Button>

          {/* Botón Ver Planes */}
          <Button
            asChild
            className="flex-1 border border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 font-semibold"
          >
            <Link href={strPlansHref}>
              {"Ver Planes →"}
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}