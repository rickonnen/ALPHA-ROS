"use client";
import { useState, useMemo } from "react";
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

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 0,
    title: "¡Bienvenido a la plataforma!",
    description: "Estás autenticado correctamente.",
    read: false,
    time: "ahora",
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Notificación ${i + 1}`,
    description: "Texto de prueba",
    read: i % 3 === 0,
    time: `hace ${i + 1}m`,
  })),
];

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [activeTab, setActiveTab] = useState<string>("all");

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

  const handleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="absolute right-10 top-26 z-50 w-80 h-111 rounded-2xl shadow-lg overflow-hidden bg-white flex flex-col max-h-120">
      <NotificationHeader total={notifications.length} />

      <div className="p-2">
        <NotificationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
          onMarkAll={handleMarkAll}
        />
      </div>

      {visibleNotifications.length === 0 ? (
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