"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";

type Notification = {
  id: number;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  createdAt?: string | null;
  type: 1 | 2 | 3;
};

// Tipo para la respuesta de la API
type ApiNotification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string | null;
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

function getTypeFilter(type: 1 | 2 | 3): string {
  switch(type) {
    case 1: return "gmail";
    case 2: return "whatsapp";
    case 3: return "general";
    default: return "general";
  }
}

interface NotificationPanelProps {
  total?: number;
  onClose?: () => void;
}

export function NotificationPanel({ total, onClose }: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  useEffect(() => {
    const userId = user?.id ?? "guest";
    const savedGmail = localStorage.getItem(`gmail_enabled_${userId}`);
    const savedWhatsapp = localStorage.getItem(`whatsapp_enabled_${userId}`);
    
    if (savedGmail !== null) setGmailEnabled(savedGmail === "true");
    if (savedWhatsapp !== null) setWhatsappEnabled(savedWhatsapp === "true");
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      
      const notificationsData: ApiNotification[] = Array.isArray(data) ? data : data.notifications;
      
      const mapped: Notification[] = notificationsData.map((n: ApiNotification) => ({
        id: n.id,
        title: n.title,
        description: n.message,
        read: n.read,
        createdAt: n.createdAt ?? null,
        type: n.type === "gmail" ? 1 : n.type === "whatsapp" ? 2 : 3,
        time: n.createdAt ? formatRelativeTime(n.createdAt) : "ahora",
      }));
      
      const sorted: Notification[] = mapped.sort((a: Notification, b: Notification) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
      
      setNotifications(sorted);
      setHasError(false);
      window.dispatchEvent(new Event("refresh-notification-badge"));
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, gmailEnabled, whatsappEnabled]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      fetchNotifications();
    };
    
    window.addEventListener("notifications-updated", handleNotificationUpdate);
    return () => {
      window.removeEventListener("notifications-updated", handleNotificationUpdate);
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const totalCount = useMemo(
    () => notifications.length,
    [notifications]
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveFilter("all");
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setActiveTab("all");
  };

  const visibleNotifications = useMemo(() => {
    if (activeFilter === "gmail") {
      return notifications.filter((n) => n.type === 1);
    }
    
    if (activeFilter === "whatsapp") {
      return notifications.filter((n) => n.type === 2);
    }
    
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read);
    }
    
    return notifications.filter((n) => {
      if (n.type === 1 && !gmailEnabled) return false;
      if (n.type === 2 && !whatsappEnabled) return false;
      return true;
    });
  }, [notifications, activeTab, activeFilter, gmailEnabled, whatsappEnabled]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchNotifications();
        window.dispatchEvent(new Event("refresh-notification-badge"));
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  const handleRead = async (id: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", notificationId: id }),
      });
      
      await fetchNotifications();
      window.dispatchEvent(new Event("refresh-notification-badge"));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const handleMarkAll = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
      
      await fetchNotifications();
      window.dispatchEvent(new Event("refresh-notification-badge"));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const getFilterDisplayName = (filter: string): string => {
    switch(filter) {
      case "gmail": return "Gmail";
      case "whatsapp": return "WhatsApp";
      default: return "";
    }
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleGmailToggle = (enabled: boolean) => {
    setGmailEnabled(enabled);
    const userId = user?.id ?? "guest";
    localStorage.setItem(`gmail_enabled_${userId}`, enabled.toString());
  };

  const handleWhatsappToggle = (enabled: boolean) => {
    setWhatsappEnabled(enabled);
    const userId = user?.id ?? "guest";
    localStorage.setItem(`whatsapp_enabled_${userId}`, enabled.toString());
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90vw] max-w-[400px] h-auto max-h-[54vh] md:max-h-[80vh] rounded-2xl shadow-lg bg-white flex flex-col overflow-hidden md:absolute md:top-full md:mt-8 md:left-auto md:right-0 md:translate-x-0">     
      <NotificationHeader total={total ?? totalCount} />

      <div className="p-2">
        {/* Componente de configuración de número de teléfono */}
        
        <NotificationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadCount={unreadCount}
          onMarkAll={handleMarkAll}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onOpenSettings={handleOpenSettings}
          showSettings={showSettings}
          onCloseSettings={handleCloseSettings}
          gmailEnabled={gmailEnabled}
          whatsappEnabled={whatsappEnabled}
          onGmailToggle={handleGmailToggle}
          onWhatsappToggle={handleWhatsappToggle}
        />
      </div>

      {!showSettings && (
        <>
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
                {activeFilter !== "all"
                  ? `No tienes notificaciones de ${getFilterDisplayName(activeFilter)}.`
                  : activeTab === "unread"
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
                    type={n.type} 
                    onDelete={handleDelete}
                    onRead={handleRead}
                  />
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </>
      )}
    </div>
  );
}
