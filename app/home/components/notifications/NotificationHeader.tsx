"use client";
import { Trash2, RotateCcw } from "lucide-react";

interface NotificationHeaderProps {
  totalCount: number;
  selectedIds?: string[];
  allIds?: string[];
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onBulkDelete?: () => void;
  onBulkMarkRead?: () => void;
  onBulkRestore?: () => void;
  isInTrash?: boolean;
}

export function NotificationHeader({
  totalCount,
  selectedIds = [],
  allIds = [],
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkMarkRead,
  onBulkRestore,
  isInTrash = false,
}: NotificationHeaderProps) {
  const hasSelected = selectedIds.length > 0;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#2C4A5A] text-white rounded-t-md min-h-[44px]">
      <h4 className="text-[20px] font-normal leading-[120%] tracking-normal flex-1">
        {hasSelected
          ? `${selectedIds.length} seleccionada${selectedIds.length > 1 ? "s" : ""}`
          : "NOTIFICACIONES"}
      </h4>

      <div className="flex items-center gap-2 justify-center">
        {hasSelected && (
          <>
            {isInTrash && onBulkRestore && (
              <button
                onClick={onBulkRestore}
                title="Restaurar seleccionadas"
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Restaurar</span>
              </button>
            )}
            {!isInTrash && onBulkMarkRead && (
              <button
                onClick={onBulkMarkRead}
                title="Marcar como leídas"
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition"
              >
                ✓
                <span className="hidden sm:inline">Leídas</span>
              </button>
            )}
            {onBulkDelete && (
              <button
                onClick={onBulkDelete}
                title={isInTrash ? "Eliminar permanentemente" : "Eliminar"}
                className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded-lg transition"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}
            <button
              onClick={onDeselectAll}
              className="text-white/70 hover:text-white transition ml-1"
              title="Cancelar selección"
            >
              ✕
            </button>
          </>
        )}
        {!hasSelected && (
          <span className="text-sm opacity-80">{totalCount}</span>
        )}
      </div>
    </div>
  );
}