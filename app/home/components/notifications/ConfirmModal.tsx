"use client";
import { Trash2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ isOpen, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 dark:bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-[320px] flex flex-col gap-4 dark:bg-[#1f2c33] dark:border dark:border-[#2b3a45]">
        <div className="flex items-center gap-3">
          <Trash2 size={20} className="text-red-500" />
          <h2 className="text-[16px] font-semibold text-gray-800 dark:text-slate-100">
            ¿Vaciar papelera?
          </h2>
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-300/80">
          Todas las notificaciones eliminadas se borrarán permanentemente. Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-[#2b3a45] dark:text-slate-300 dark:hover:bg-[#263540]"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Vaciar
          </button>
        </div>

      </div>
    </div>
  );
}