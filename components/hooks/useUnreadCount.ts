/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      const userId = user?.id ?? "guest";
      const stored = localStorage.getItem(`deletedNotificationIds_${userId}`);
      const deletedIds: number[] = stored ? JSON.parse(stored) : [];
      const filtered = data.filter((n: any) => !deletedIds.includes(n.id));
      setUnreadCount(filtered.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
  }, [fetchUnreadCount, user]);
  
  useEffect(() => {
    if (!user) return;
    
    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener("refresh-notification-badge", handleRefresh);
    
    return () => window.removeEventListener("refresh-notification-badge", handleRefresh);
  }, [fetchUnreadCount, user]);

  return unreadCount;
}