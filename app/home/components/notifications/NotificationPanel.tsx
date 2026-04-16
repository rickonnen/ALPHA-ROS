"use client";
import { useState, useMemo, useEffect } from "react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext"; //NUEVO

type Notification = {
  id: number;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  createdAt?: string | null;
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${days} d`;
}

export function NotificationPanel() {
  const { user } = useAuth(); //NUEVO - obtiene el usuario logueado
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        //NUEVO - clave única por usuario
        const userId = user?.id ?? "guest";
        const stored = localStorage.getItem(`deletedNotificationIds_${userId}`);
        const localDeletedIds: number[] = stored ? JSON.parse(stored) : [];

        const res = await fetch("/api/notifications");
        const data = await res.json();
        const mapped = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.message,
          read: n.read,
          createdAt: n.createdAt ?? null,   // ← agrega esta línea
          time: n.createdAt ? formatRelativeTime(n.createdAt) : "ahora",
        }));
        
        const sorted = mapped.sort((a: any, b: any) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()  // ← cambia esta línea
        );
        
        setNotifications(sorted.filter((n: any) => !localDeletedIds.includes(n.id)));
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]); //NUEVO - se ejecuta cuando el usuario está disponible

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, activeTab]);

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    //NUEVO - guarda con clave única por usuario
    const userId = user?.id ?? "guest";
    const stored = localStorage.getItem(`deletedNotificationIds_${userId}`);
    const current: number[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(`deletedNotificationIds_${userId}`, JSON.stringify([...current, id]));
  };

  const handleRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", notificationId: id }),
      });
      window.dispatchEvent(new Event("refresh-notification-badge"));
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
      window.dispatchEvent(new Event("refresh-notification-badge"));
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  return (
<div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90vw] max-w-[400px] h-auto max-h-[54vh] md:max-h-[80vh] rounded-2xl shadow-lg bg-white flex flex-col overflow-hidden md:absolute md:top-full md:mt-8 md:left-auto md:right-0 md:translate-x-0">     
 <NotificationHeader total={notifications.length} />

      <div className="p-2">
        <NotificationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
          onMarkAll={handleMarkAll}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
          Cargando notificaciones...
        </div>
      ) : hasError ? (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <BellOff size={22} />
        </div>
        <p className="text-gray-500 text-sm font-medium">
          No fue posible cargar las notificaciones.
        </p>
      </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <BellOff size={22} />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {activeTab === "unread"
              ? "No tienes notificaciones no leídas."
              : "No tienes notificaciones por el momento."}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {visibleNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                id={n.id}
                title={n.title}
                description={n.description}
                read={n.read}
                time={n.time}
                onDelete={handleDelete}
                onRead={handleRead}
              />
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}
    </div>
  );
}