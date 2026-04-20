"use client";

import { useEffect, useState } from "react";
import { useUnreadCount } from "@/components/hooks/useUnreadCount";
import { useAuth } from "@/app/auth/AuthContext";

export function NotificationBadge() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const { unreadCount, refreshCount } = useUnreadCount(user);

  useEffect(() => {
    setCount(unreadCount);
  }, [unreadCount]);

  // Escuchar eventos de refresco
  useEffect(() => {
    const handleRefresh = () => {
      refreshCount();
    };
    
    window.addEventListener("refresh-notification-badge", handleRefresh);
    window.addEventListener("notifications-updated", handleRefresh);
    
    return () => {
      window.removeEventListener("refresh-notification-badge", handleRefresh);
      window.removeEventListener("notifications-updated", handleRefresh);
    };
  }, [refreshCount]);

  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
      {count > 99 ? '99+' : count}
    </span>
  );
}
