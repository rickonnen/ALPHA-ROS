"use client";

/**
 * @Dev: JimmyP
 * @Fecha: 28/03/2026
 * @Modificación: StefanyS — 29/03/2026
 * @Funcionalidad: Modal de la HU5. Se monta únicamente cuando PropertyActions
 *                 confirma que cant_publicaciones_restantes = 0.
 *                 Botones en color terracota/naranja, responsive para mobile y desktop.
 * @param {FreePublicationLimitModalProps} props - Callback y textos del modal.
 * @return {JSX.Element} AlertDialog abierto con tipografía Geist Sans.
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
  onBack:          () => void;
  strPlansHref?:   string;
  strTitle?:       string;
  strDescription?: string;
}

export default function FreePublicationLimitModal({
  onBack,
  strPlansHref   = "/frontend/cobros/planes",
  strTitle       = "Has excedido tus publicaciones gratuitas",
  strDescription = "Tu plan gratuito te concede 2 publicaciones gratuitas, cambia a un plan de pago para hacer más publicaciones",
}: FreePublicationLimitModalProps) {
  return (
    <AlertDialog open={true}>
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