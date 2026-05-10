"use client";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: modal genérico de confirmación para acciones destructivas (eliminar, salir, etc.)
 */
import { Loader2 } from "lucide-react";

export default function ConfirmModal({ isOpen, title, confirmText = "Eliminar", cancelText = "Cancelar", isProcessing, onConfirm, onCancel }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 backdrop-blur-sm px-4">
      <div className="bg-card-bg border border-card-border sm:max-w-[320px] w-full rounded-2xl p-6 flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-[18px] font-bold text-foreground text-center mb-6 leading-snug">{title}</h3>
        <div className="flex w-full gap-3">
          <button onClick={onConfirm} disabled={isProcessing} className="flex-1 bg-destructive text-destructive-foreground text-[15px] font-bold py-3.5 rounded-xl transition-opacity flex justify-center items-center disabled:opacity-50">
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmText}
          </button>
          <button onClick={onCancel} disabled={isProcessing} className="flex-1 bg-secondary-fund text-foreground text-[15px] font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}