//Aquí se maneja el numero de notificaciones totales de la campana
"use client";

export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
       {count}
    </span>
  );
}