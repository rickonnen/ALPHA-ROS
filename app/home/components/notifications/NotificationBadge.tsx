"use client";
import { useState, useEffect } from "react";

export function NotificationBadge({ count }: { count: number }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem("notification_unread_count");
      if (stored) {
        setUnreadCount(parseInt(stored, 10));
      } else {
        setUnreadCount(count);
      }
    };

    updateCount();

    window.addEventListener("refresh-notification-badge", updateCount);
    return () => {
      window.removeEventListener("refresh-notification-badge", updateCount);
    };
  }, [count]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}