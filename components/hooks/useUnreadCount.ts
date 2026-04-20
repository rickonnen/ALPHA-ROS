import { useState, useEffect, useCallback } from "react";
import { useNotificationUpdates } from "./useNotificationUpdates";

export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      
      const notifications = Array.isArray(data) ? data : data.notifications;
      
      if (Array.isArray(notifications)) {
        const count = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(count);
        return count;
      } else {
        setUnreadCount(0);
        return 0;
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
      return 0;
    }
  }, [user]);

  useNotificationUpdates(() => {
    fetchUnreadCount();
  });

  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return { 
    unreadCount, 
    refreshCount: fetchUnreadCount 
  };
}
