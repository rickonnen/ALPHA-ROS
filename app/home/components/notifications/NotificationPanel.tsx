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

type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  createdAt?: string | null;
  type?: string | number;
};

type NotificationRow = {
  id_notificacion: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  creado_en?: string | null;
  tipo?: string | number | null;
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

function mapNotificationRow(n: NotificationRow): Notification {
  return {
    id: n.id_notificacion,
    title: n.titulo,
    description: n.mensaje,
    read: n.leido,
    createdAt: n.creado_en ?? null,
    time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
    type: n.tipo ?? "general",
  };
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
export function NotificationPanel({ onVerTodas }: NotificationPanelProps) {
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

        const mapped = (data ?? []).map((n: NotificationRow) => mapNotificationRow(n));

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
        const n = payload.new as NotificationRow;
        setNotifications((prev) => [mapNotificationRow(n), ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
  if (!user?.id) return;
  const loadTrash = () => {
    const raw = localStorage.getItem(`trash_notif_ids_${user.id}`);
    if (!raw) {
      setTrash([]);
      return;
    }
    const parsed = JSON.parse(raw);
    const saved: { id: string; read: boolean }[] = Array.isArray(parsed)
      ? parsed.map((s) => (typeof s === "string" ? { id: s, read: true } : s))
      : [];
    setTrash(() => {
      const todas = [...notifications];
      return saved.map((s) => {
        const notif = todas.find((n) => n.id === s.id);
        return notif ? { ...notif, read: s.read } : null;
      }).filter(Boolean) as Notification[];
    });
  };
  loadTrash();
  window.addEventListener("trash-updated", loadTrash);
  return () => window.removeEventListener("trash-updated", loadTrash);
}, [user?.id, notifications]);


  const notInTrash = useMemo(() => 
    notifications.filter((n) => !trash.some((t) => t.id === n.id)), 
    [notifications, trash]
  );
  
  const unreadCount = useMemo(() => notInTrash.filter((n) => !n.read).length, [notInTrash]);
  const totalCount = useMemo(() => notInTrash.length, [notInTrash]);

  // Actualizar el badge cada vez que cambia el contador de no leídas
  useEffect(() => {
    updateUnreadCountBadge(unreadCount);
  }, [unreadCount]);

  const visibleNotifications = useMemo(() => {
    if (activeTab === "trash") return trash;
    let filtered = notInTrash;
    if (activeFilter === "gmail") filtered = filtered.filter((n) => n.type === 1 || n.type === "gmail");
    else if (activeFilter === "whatsapp") filtered = filtered.filter((n) => n.type === 2 || n.type === "whatsapp");
    else if (activeTab === "unread") filtered = filtered.filter((n) => !n.read);
    return filtered;
  }, [notInTrash, activeTab, activeFilter, trash]);
  ///////////////////////HU2////////////
  const handleDelete = (id: string) => {
  const notif = notifications.find((n) => n.id === id);
  if (!notif) return;
  setTrash((prev) => {
    if (prev.some((t) => t.id === id)) return prev;
    const next = [notif, ...prev];
    localStorage.setItem(`trash_notif_ids_${user?.id}`,
      JSON.stringify(next.map((n) => ({ id: n.id, read: n.read }))));
    const evt = new Event("trash-updated");
    (evt as any).detail = { type: "delete", id };
    window.dispatchEvent(evt);
    return next;
  });
};
const handleRestore = (id: string) => {
  setTrash((prevTrash) => {
    const notif = prevTrash.find((n) => n.id === id);
    if (!notif) return prevTrash;
    const remaining = prevTrash.filter((n) => n.id !== id);
    localStorage.setItem(`trash_notif_ids_${user?.id}`,
      JSON.stringify(remaining.map((n) => ({ id: n.id, read: n.read }))));
    const evt = new Event("trash-updated");
    (evt as any).detail = { type: "restore", id };
    window.dispatchEvent(evt);
    return remaining;
  });
};
  const handleEmptyTrash = () => {
    setTrash([]);
    localStorage.removeItem(`trash_notif_ids_${user?.id}`);
    const evt = new Event("trash-updated");
    (evt as any).detail = { type: "empty" };
    window.dispatchEvent(evt);
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
    <div className="notification-system-theme fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90vw] max-w-[400px] h-auto max-h-[54vh] md:max-h-[80vh] rounded-2xl shadow-lg bg-[var(--notification-surface)] text-[var(--notification-text)] flex flex-col overflow-hidden md:absolute md:top-full md:mt-8 md:left-auto md:right-0 md:translate-x-0">

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
          <NotificationHeader totalCount={totalCount} />

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
              className="text-xs text-[var(--notification-danger)] hover:underline transition"
              >
                Vaciar papelera
              </button>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-[var(--notification-muted)] text-sm">
              Cargando notificaciones...
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--notification-muted-surface)] flex items-center justify-center text-[var(--notification-muted)]">
                <BellOff size={22} />
              </div>
              <p className="text-[var(--notification-muted)] text-sm font-medium">
                No fue posible cargar las notificaciones.
              </p>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--notification-muted-surface)] flex items-center justify-center text-[var(--notification-muted)]">
                <BellOff size={22} />
              </div>
              <p className="text-[var(--notification-muted)] text-sm font-medium">
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
        <div className="p-3 border-t border-[var(--notification-border)]">
          <button
            onClick={() => {
              onVerTodas?.();
            }}
            className="w-full py-2 text-sm font-medium text-center bg-[var(--notification-button)] text-[var(--notification-button-foreground)] hover:bg-[var(--notification-button-hover)] rounded-xl transition"
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

      <style jsx>{`
        .notification-system-theme {
          color-scheme: light;
          --notification-surface: #ffffff;
          --notification-page-bg: #f2ede4;
          --notification-card: #f3f4f6;
          --notification-muted-surface: #f3f4f6;
          --notification-item-read: #ffffff;
          --notification-item-unread: #f3f4f6;
          --notification-item-border-read: #f3f4f6;
          --notification-item-border-unread: #e5e7eb;
          --notification-text: #111827;
          --notification-title-read: #4b5563;
          --notification-title-unread: #000000;
          --notification-muted: #6b7280;
          --notification-subtle: #9ca3af;
          --notification-border: #f3f4f6;
          --notification-header: #2c4a5a;
          --notification-header-foreground: #ffffff;
          --notification-button: #2c4a5a;
          --notification-button-hover: #1e3a4a;
          --notification-button-soft: #2c4a5a1a;
          --notification-button-foreground: #ffffff;
          --notification-tab-active-bg: #ffffff;
          --notification-tab-active-border: transparent;
          --notification-tab-active-text: #111827;
          --notification-danger: #ef4444;
          --notification-danger-soft: #fef2f2;
          --notification-success: #16a34a;
          --notification-success-soft: #f0fdf4;
          --notification-warning-bg: #fefce8;
          --notification-warning-border: #fde68a;
          --notification-warning-text: #a16207;
          --notification-input-bg: #ffffff;
        }

        @media (prefers-color-scheme: dark) {
          .notification-system-theme {
            color-scheme: dark;
            --notification-surface: #333333;
            --notification-page-bg: #292929;
            --notification-card: #474747;
            --notification-muted-surface: #474747;
            --notification-item-read: #333333;
            --notification-item-unread: #474747;
            --notification-item-border-read: #1f1f1f;
            --notification-item-border-unread: #666666;
            --notification-text: #ebebeb;
            --notification-title-read: #d8d8d8;
            --notification-title-unread: #ffffff;
            --notification-muted: #a3a3a3;
            --notification-subtle: #c7c7c7;
            --notification-border: #1f1f1f;
            --notification-header: #333333;
            --notification-header-foreground: #ebebeb;
            --notification-button: #474747;
            --notification-button-hover: #555555;
            --notification-button-soft: #ffffff14;
            --notification-button-foreground: #ebebeb;
            --notification-tab-active-bg: transparent;
            --notification-tab-active-border: #ebebeb;
            --notification-tab-active-text: #ebebeb;
            --notification-danger: #ff6b6b;
            --notification-danger-soft: #4a2626;
            --notification-success: #5fd37c;
            --notification-success-soft: #245437;
            --notification-warning-bg: #4a3a1e;
            --notification-warning-border: #8a6b2d;
            --notification-warning-text: #f0c06f;
            --notification-input-bg: #333333;
          }
        }
      `}</style>

    </div>
  );
}
