"use client";

/**
 * @file FreePublicationLimitModal.tsx
 * @description Modal de la HU5 que alerta al usuario cuando ha excedido el límite 
 * de publicaciones gratuitas permitidas por su plan.
 */

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

// Uso de PascalCase para la Interfaz
interface FreePublicationLimitModalProps {
  intPublicationCount: number;
  bolIsPremium: boolean;
  onBack: () => void; // Función callback
  intFreeLimit?: number;
  strPlansHref?: string;
  strTitle?: string;
  strDescription?: string;
}

/**
 * Componente funcional para el modal de límite de publicaciones.
 * Aplica validaciones booleanas para disparar la alerta y redirigir a planes.
 * * @param {FreePublicationLimitModalProps} props - Propiedades inyectadas al modal.
 * @returns {JSX.Element} El componente renderizado del Modal (AlertDialog).
 */
export default function FreePublicationLimitModal({
  intPublicationCount,
  bolIsPremium,
  onBack,
  intFreeLimit = 2,
  strPlansHref = "/pagina-cobros",
  strTitle = "Has excedido tus publicaciones gratuitas",
  strDescription =
    "Tu plan gratuito te concede 2 publicaciones gratuitas, cambia a un plan de pago para hacer más publicaciones",
}: FreePublicationLimitModalProps) {
  
  // Nomenclatura camelCase con prefijo 'bol' para la constante de evaluación
  const bolHasExceededFreePosts = !bolIsPremium && intPublicationCount >= intFreeLimit;

  return (
    <AlertDialog open={bolHasExceededFreePosts}>
      <AlertDialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto rounded-3xl p-6 sm:p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-semibold text-center">
            {strTitle}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="mt-4 text-base text-slate-700 text-center">
            {strDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full sm:w-1/2"
          >
            {"< Atrás"}
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-1/2"
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