"use client";

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ isOpen, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-[320px] flex flex-col gap-4">
        
        <h2 className="text-[16px] font-semibold text-gray-800">
          ¿Vaciar papelera?
        </h2>

        <p className="text-sm text-gray-500">
          Todas las notificaciones eliminadas se borrarán permanentemente. Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
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