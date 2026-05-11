"use client";

interface NotificationHeaderProps {
  unreadCount: number; // Cambiar de total a unreadCount
}

export function NotificationHeader({ unreadCount }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#2C4A5A] text-white rounded-t-md">
      <h4 className="text-[20px] font-normal leading-[120%] tracking-normal">
        Notificaciones
      </h4>

      <span>{unreadCount}</span> {/* Mostrar no leídas */}
    </div>
  );
}