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
      <div className="bg-[var(--notification-surface)] text-[var(--notification-text)] rounded-2xl shadow-xl p-6 w-[90%] max-w-[320px] flex flex-col gap-4">
        
        <h2 className="text-[16px] font-semibold text-[var(--notification-text)]">
          ¿Vaciar papelera?
        </h2>

        <p className="text-sm text-[var(--notification-muted)]">
          Todas las notificaciones eliminadas se borrarán permanentemente. Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--notification-border)] text-[var(--notification-muted)] hover:bg-[var(--notification-card)] transition"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--notification-danger)] text-[var(--notification-button-foreground)] transition"
          >
            Vaciar
          </button>
        </div>

      </div>
    </div>
  );
}
