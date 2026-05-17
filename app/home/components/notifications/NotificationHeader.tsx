"use client";

interface NotificationHeaderProps {
  totalCount: number; // Total de notificaciones (todas las que no están en papelera)
}

export function NotificationHeader({ totalCount }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[var(--notification-header)] text-[var(--notification-header-foreground)] rounded-t-md">
      <h4 className="text-[20px] font-normal leading-[120%] tracking-normal">
        Notificaciones
      </h4>

      <span>{totalCount}</span> {/* Mostrar total de notificaciones */}
    </div>
  );
}
