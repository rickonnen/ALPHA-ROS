"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FreePublicationLimitModalProps = {
  publicationCount: number;
  isPremium: boolean;
  onBack: () => void;
  freeLimit?: number;
  plansHref?: string;
  title?: string;
  description?: string;
};

export default function FreePublicationLimitModal({
  publicationCount,
  isPremium,
  onBack,
  freeLimit = 2,
  plansHref = "/pagina-cobros",
  title = "Has excedido tus publicaciones gratuitas",
  description =
    "Tu plan gratuito te concede 2 publicaciones gratuitas, cambia a un plan de pago para hacer más publicaciones",
}: FreePublicationLimitModalProps) {
  // Verificación de límite de publicaciones
  const hasExceededFreePosts = !isPremium && publicationCount >= freeLimit;

  return (
    <AlertDialog open={hasExceededFreePosts}>
      <AlertDialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto rounded-3xl p-6 sm:p-8">
        <AlertDialogHeader>
          {/* Aplicando la tipografía H2 de tu guía: text-3xl font-semibold */}
          <AlertDialogTitle className="text-3xl font-semibold text-center">
            {title}
          </AlertDialogTitle>
          
          {/* Aplicando la tipografía de Párrafo de tu guía: text-base text-slate-700 */}
          <AlertDialogDescription className="mt-4 text-base text-slate-700 text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:space-x-0">
          {/* Usamos puramente la variante "ghost" del estándar de shadcn */}
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full sm:w-1/2"
          >
            {"< Atrás"}
          </Button>

          {/* Usamos puramente la variante "outline" o "secondary" para heredar tu globals.css */}
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-1/2"
          >
            <Link href={plansHref}>
              {"Ver Planes →"}
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}