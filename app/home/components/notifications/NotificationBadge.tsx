"use client";

import { useEffect, useState } from "react";

interface NotificationBadgeProps {
  count?: number;
}

export function NotificationBadge({ count = 0 }: NotificationBadgeProps) {
  const [optimisticCount, setOptimisticCount] = useState<number>(count);

  // Sincronizar cuando el padre actualiza el count
  useEffect(() => {
    setOptimisticCount(count);
  }, [count]);

  // Escuchar actualizaciones en tiempo real del panel
  useEffect(() => {
    const handleOptimisticSync = (e: Event) => {
      setOptimisticCount((e as CustomEvent<number>).detail);
    };
    window.addEventListener("optimistic-unread-sync", handleOptimisticSync);
    return () => window.removeEventListener("optimistic-unread-sync", handleOptimisticSync);
  }, []);

  if (optimisticCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10 pointer-events-none">
      {optimisticCount > 99 ? "99+" : optimisticCount}
    </span>
  );
}