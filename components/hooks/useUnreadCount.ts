/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    fetch("/api/notifications")
      .then(r => r.json())
      .then((data: { id: number; read: boolean }[]) => {
        const userId = (user as any)?.id ?? "guest";
        const stored = typeof window !== "undefined" 
          ? localStorage.getItem(`deletedNotificationIds_${userId}`) 
          : null;
        const deletedIds: number[] = stored ? JSON.parse(stored) : [];
        const filtered = data.filter(n => !deletedIds.includes(n.id));
        setUnreadCount(filtered.filter(n => !n.read).length);
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount();
  }, [fetchUnreadCount, user]);

  return unreadCount;
}