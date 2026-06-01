/*  Dev: David Chavez Totora - sow-davidc 
    Fecha: 05/04/2026
    Funcionalidad: modal de confirmacion originalmente para el logout, pero reutilizable para cualquier accion que requiera confirmacion
      - @param {llamada} - se llama con el titulo, mensaje, funcion a ejecutar al confirmar, funcion a ejecutar al cancelar, y opcionalmente los textos de los botones
      - @return {accion} - se confirma una accion o se cancela, cerrando el modal
*/

"use client";

import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative text-center">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>

        <div className="flex justify-center mb-4">
          <AlertTriangle size={52} className="text-yellow-500" />
        </div>

        <h3 className="text-lg font-bold mb-2 text-slate-800">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>

        <div className="flex gap-3">
          <Button variant="outline" className="w-[50%]" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" className="w-[50%]" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}