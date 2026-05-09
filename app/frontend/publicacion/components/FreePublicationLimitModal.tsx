"use client";
/**
 * @Dev: jimmyP
 * @Fecha: 29/03/2026
 * @Funcionalidad: Modal de la HU5. Controlado externamente por bolOpen.
 * Solo se muestra cuando PropertyActions confirma límite alcanzado
 * y activa bolOpen=true. Nunca se abre solo al montar.
 * @param {FreePublicationLimitModalProps} props - Callback, estado y textos del modal.
 * @return {JSX.Element | null} AlertDialog controlado o null si bolOpen es false.
 */

// 1. IMPORTACIÓN CORREGIDA PARA NAVEGACIÓN (Solución a RM5-01)
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

// PascalCase para la interfaz - Estándar Alpha-Ros
interface FreePublicationLimitModalProps {
  bolOpen: boolean;   // controla si el modal está visible
  onBack: () => void;
  strPlansHref?: string;
  strTitle?: string;
  strDescription?: string;
}

export default function FreePublicationLimitModal({
  bolOpen,
  onBack,
  strPlansHref = "/frontend/cobros/planes",
  strTitle = "Has excedido tus publicaciones gratuitas",
  strDescription = "Tu plan gratuito te concede 2 publicaciones gratuitas, cambia a un plan de pago para hacer más publicaciones",
}: FreePublicationLimitModalProps) {
  
  // Instanciamos el enrutador de Next.js
  const router = useRouter(); 

  // No renderizar nada si el modal está cerrado
  if (!bolOpen) return null;

  return (
    <AlertDialog open={bolOpen}>
      <AlertDialogContent
        // Añadido bg-white para evitar colores de fondo heredados
        className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-8 bg-white" 
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

        {/* Añadido bg-transparent para evitar el fondo raro reportado en RM5-04 */}
        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-between gap-3 sm:gap-4 bg-transparent border-none">
          
          {/* BOTÓN ATRÁS */}
          <Button
            type="button"
            variant="outline" // RM5-02 y RM5-07: Ambos botones ahora usan el mismo variante base
            onClick={onBack}
            // RM5-03: cursor-pointer explícito. Mismas clases exactas para ambos botones
            className="flex-1 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 hover:text-[#C26E5A] font-semibold cursor-pointer"
          >
            {"< Atrás"}
          </Button>

          {/* BOTÓN VER PLANES */}
          <Button
            type="button"
            variant="outline" // RM5-02 y RM5-07: Unificados
            className="flex-1 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 hover:text-[#C26E5A] font-semibold cursor-pointer"
            onClick={() => {
              onBack(); // Primero cerramos el modal limpiamente
              router.push(strPlansHref); // RM5-01: Navegación nativa de Next.js sin crashear la página
            }}
          >
            {"Ver Planes →"}
          </Button>

        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}