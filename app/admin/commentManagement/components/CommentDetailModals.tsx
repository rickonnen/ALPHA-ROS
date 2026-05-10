import { ShieldAlert, Trash2, X } from "lucide-react";
import { CLS_FOCUS } from "../[commentId]/types";

/**
 * dev: Maicol Ismael Nina Zarate     fecha: 06/05/2026
 * funcionalidad: Modales de confirmación para acciones sobre comentarios
 * - SoftDeleteModal: confirma borrado lógico (soft delete)
 * - HardDeleteModal: confirma borrado permanente (hard delete)
 */

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SoftDeleteModal({ isOpen, onClose, onConfirm }: ModalBaseProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-card-border rounded-lg shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <Trash2 className="h-5 w-5 text-secondary-foreground" />
            Borrar comentario
          </div>
          <button onClick={onClose} className={`text-muted-foreground hover:text-foreground ${CLS_FOCUS}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-body-info text-foreground/80">
          ¿Estás seguro de que deseas <span className="font-bold text-foreground">borrar</span> este comentario?
          Esta acción puede revertirse.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase border border-card-border bg-secondary-fund hover:bg-secondary-fund/70 text-foreground transition-colors ${CLS_FOCUS}`}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/90 shadow-sm transition-transform hover:scale-105 ${CLS_FOCUS}`}
          >
            Borrar <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

export function HardDeleteModal({ isOpen, onClose, onConfirm }: ModalBaseProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-card-border rounded-lg shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Borrado permanente
          </div>
          <button onClick={onClose} className={`text-muted-foreground hover:text-foreground ${CLS_FOCUS}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-body-info text-foreground/80">
          ¿Estás seguro? Esta acción es <span className="font-bold text-destructive">irreversible</span>.
          El comentario será eliminado definitivamente.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase border border-card-border bg-secondary-fund hover:bg-secondary-fund/70 text-foreground transition-colors ${CLS_FOCUS}`}
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase bg-destructive text-destructive-foreground border border-destructive hover:bg-destructive/90 shadow-sm transition-transform hover:scale-105 ${CLS_FOCUS}`}
          >
            Eliminar <ShieldAlert className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}