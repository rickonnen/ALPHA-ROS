"use client";
import { useState, useMemo, useEffect } from "react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";

type Notification = {
  id: number;
  title: string;
  description: string;
  read: boolean;
  time?: string;
};

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar notificaciones desde el backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        // Mapear "message" del backend a "description" que usa tu UI
        const mapped = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.message,
          read: n.read,
          time: "ahora",
        }));
        setNotifications(mapped);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
  };

  const handleRead = async (id: number) => {
    // Actualizar localmente
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // Sincronizar con backend
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", notificationId: id }),
      });
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const handleMarkAll = async () => {
    // Actualizar localmente
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Sincronizar con backend
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  return (
    <div className="absolute right-10 top-26 z-50 w-80 h-111 rounded-2xl shadow-lg bg-white flex flex-col max-h-120">
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