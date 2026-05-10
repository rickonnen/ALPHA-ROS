"use client";
import { useState, useMemo, useEffect } from "react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem";
import { SettingsPanel } from "./SettingsPanel";
////////////////////////
import { ConfirmModal } from "./ConfirmModal";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  createdAt?: string | null;
  type?: string | number;
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

// Función helper para actualizar el badge
const updateUnreadCountBadge = (count: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("notification_unread_count", count.toString());
    window.dispatchEvent(new Event("refresh-notification-badge"));
  }
};

interface NotificationPanelProps {
  onClose?: () => void;
  onVerTodas?: () => void;
}
export function NotificationPanel({ onClose, onVerTodas }: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
//////////////////////////////HU2//////////
  const router = useRouter();

  const [trash, setTrash] = useState<Notification[]>([]);
  useEffect(() => {
    const userId = user?.id ?? "guest";
    const savedGmail = localStorage.getItem(`gmail_enabled_${userId}`);
    const savedWhatsapp = localStorage.getItem(`whatsapp_enabled_${userId}`);
    if (savedGmail !== null) setGmailEnabled(savedGmail === "true");
    if (savedWhatsapp !== null) setWhatsappEnabled(savedWhatsapp === "true");
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

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
          type: "general",
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

    const channel = supabase
      .channel(`notificaciones-panel-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`,
      }, (payload) => {
        const n = payload.new as any;
        setNotifications((prev) => [{
          id: n.id_notificacion,
          title: n.titulo,
          description: n.mensaje,
          read: n.leido,
          createdAt: n.creado_en ?? null,
          time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
          type: "general",
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Actualizar el badge cada vez que cambia el contador de no leídas
  useEffect(() => {
    updateUnreadCountBadge(unreadCount);
  }, [unreadCount]);

  const visibleNotifications = useMemo(() => {
  if (activeTab === "trash") return trash;
  let filtered = notifications;
    if (activeFilter === "gmail") filtered = filtered.filter((n) => n.type === 1 || n.type === "gmail");
    else if (activeFilter === "whatsapp") filtered = filtered.filter((n) => n.type === 2 || n.type === "whatsapp");
    else if (activeTab === "unread") filtered = filtered.filter((n) => !n.read);
    return filtered;
}, [notifications, activeTab, activeFilter, trash]);
///////////////////////HU2////////////
  const handleDelete = (id: string) => {
  const notif = notifications.find((n) => n.id === id);
  if (notif) setTrash((prev) => [notif, ...prev]);
  setNotifications((prev) => prev.filter((n) => n.id !== id));
};

const handleRestore = (id: string) => {
  const notif = trash.find((n) => n.id === id);
  if (notif) {
    setNotifications((prev) => [notif, ...prev]);
    setTrash((prev) => prev.filter((n) => n.id !== id));
    
  }
};

const handleEmptyTrash = () => {
  setTrash([]);
  setShowConfirmModal(false);
};
  const handleRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("Notificacion").update({ leido: true }).eq("id_notificacion", id);
    // El badge se actualizará automáticamente cuando cambie unreadCount
  };

  const handleMarkAll = async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("Notificacion").update({ leido: true }).eq("id_usuario", user.id);
    // El badge se actualizará automáticamente cuando cambie unreadCount
  };

  const handleGmailToggle = (enabled: boolean) => {
    setGmailEnabled(enabled);
    localStorage.setItem(`gmail_enabled_${user?.id ?? "guest"}`, enabled.toString());
  };

  const handleWhatsappToggle = (enabled: boolean) => {
    setWhatsappEnabled(enabled);
    localStorage.setItem(`whatsapp_enabled_${user?.id ?? "guest"}`, enabled.toString());
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90vw] max-w-[400px] h-auto max-h-[54vh] md:max-h-[80vh] rounded-2xl shadow-lg bg-white flex flex-col overflow-hidden md:absolute md:top-full md:mt-8 md:left-auto md:right-0 md:translate-x-0">
      
      {showSettings ? (
        // Mostrar solo el panel de configuración
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          gmailEnabled={gmailEnabled}
          whatsappEnabled={whatsappEnabled}
          onGmailToggle={handleGmailToggle}
          onWhatsappToggle={handleWhatsappToggle}
        />
      ) : (
        // Mostrar el panel de notificaciones completo
        <>
          <NotificationHeader unreadCount={unreadCount} />

          <div className="p-2">
            <NotificationTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setActiveFilter("all");
              }}
              unreadCount={unreadCount}
               trashCount={trash.length}
              onMarkAll={handleMarkAll}
              onOpenSettings={() => setShowSettings(true)}
            />
          </div>
            {activeTab === "trash" && trash.length > 0 && (
  <div className="flex justify-end px-3 pb-1">
    <button
      onClick={() => setShowConfirmModal(true)}
      className="text-xs text-red-500 hover:text-red-700 hover:underline transition"
    >
      Vaciar papelera
    </button>
  </div>
)}
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
                   : activeTab === "trash"
                  ? "La papelera está vacía."
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
    isInTrash={activeTab === "trash"}
    onRestore={handleRestore}
  />
))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </>
      )}
      {/* Botón Ver todas - HU-02 */}
      {!showSettings && (
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => {
              onVerTodas?.();
            }}
            className="w-full py-2 text-sm font-medium text-center bg-[#2C4A5A] text-white hover:bg-[#1e3a4a] rounded-xl transition"
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}

    <ConfirmModal
  isOpen={showConfirmModal}
  onConfirm={handleEmptyTrash}
  onCancel={() => setShowConfirmModal(false)}
/>


    </div>
  );
}