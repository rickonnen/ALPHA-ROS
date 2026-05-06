"use client";
import { useState, useEffect } from "react";

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      // Leer el contador del localStorage
      const stored = localStorage.getItem("notification_unread_count");
      if (stored) {
        setUnreadCount(parseInt(stored, 10));
      } else {
        setUnreadCount(0);
      }
    };

    // Actualizar al montar el componente
    updateCount();

    // Escuchar el evento personalizado
    window.addEventListener("refresh-notification-badge", updateCount);
    
    return () => {
      window.removeEventListener("refresh-notification-badge", updateCount);
    };
  }, []);

  // Si no hay notificaciones no leídas, no mostrar el badge
  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}