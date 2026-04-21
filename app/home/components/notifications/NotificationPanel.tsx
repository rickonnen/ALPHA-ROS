"use client";
import { useState, useMemo, useEffect } from "react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";
import { createClient } from "@supabase/supabase-js";

type Notification = {
  id: string; // ← ahora es string porque es UUID
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function NotificationPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
      console.log("👤 user en panel:", user?.id) // ← agrega esto
    if (!user?.id) return;
    

    // Cargar notificaciones iniciales desde Supabase
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("Notificacion")
          .select("*")
          .eq("id_usuario", user.id)
          .order("creado_en", { ascending: false });

        if (error) throw error;

        const mapped = (data ?? []).map((n: any) => ({
          id: n.id_notificacion,
          title: n.titulo,
          description: n.mensaje,
          read: n.leido,
          createdAt: n.creado_en ?? null,
          time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
        }));

        setNotifications(mapped);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // WebSocket — escucha notificaciones nuevas en tiempo real
    const channel = supabase
      .channel("notificaciones-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notificacion",
          filter: `id_usuario=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as any;
          const nueva: Notification = {
            id: n.id_notificacion,
            title: n.titulo,
            description: n.mensaje,
            read: n.leido,
            createdAt: n.creado_en ?? null,
            time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
          };
          setNotifications((prev) => [nueva, ...prev]);
        }
      )
      .subscribe();

    // Limpia la conexión cuando el usuario cierra o cambia
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, activeTab]);

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("Notificacion").delete().eq("id_notificacion", id);
  };

  const handleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await supabase
      .from("Notificacion")
      .update({ leido: true })
      .eq("id_notificacion", id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
  };

  const handleMarkAll = async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from("Notificacion")
      .update({ leido: true })
      .eq("id_usuario", user.id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
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