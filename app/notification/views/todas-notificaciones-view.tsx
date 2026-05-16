"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/app/auth/AuthContext";
import { NotificationItem } from "@/app/home/components/notifications/NotificationItem";
import { BellOff, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/app/home/components/notifications/ConfirmModal";


type Notificacion = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  type?: string;
};

type NotificationRow = {
  id_notificacion: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  creado_en?: string | null;
  tipo?: string | null;
};

type TrashNotificationStore = string | {
  id: string;
  read?: boolean;
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

function mapNotificationRow(n: NotificationRow): Notificacion {
  return {
    id: n.id_notificacion,
    title: n.titulo,
    description: n.mensaje,
    read: n.leido,
    time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
    type: n.tipo ?? "general",
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  onClose?: () => void;
}

export function TodasNotificacionesView({ onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
const [activeTab, setActiveTab] = useState<"todas" | "no-leidas" | "papelera">("todas");


const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [trash, setTrash] = useState<Notificacion[]>([]);
const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("Notificacion")
          .select("*")
          .eq("id_usuario", user.id)
          .order("creado_en", { ascending: false });
        if (error) throw error;
        setNotificaciones((data ?? []).map((n: NotificationRow) => mapNotificationRow(n)));
      } catch { setHasError(true); }
      finally { setIsLoading(false); }
    };
    fetch();

    const channel = supabase
      .channel(`todas-notif-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`
      }, (payload) => {
        const n = payload.new as NotificationRow;
        setNotificaciones((prev) => [mapNotificationRow(n), ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const loadTrash = () => {
      const raw = localStorage.getItem(`trash_notif_ids_${user.id}`);
      if (!raw) { setTrash([]); return; }
      const saved = JSON.parse(raw) as TrashNotificationStore[];
      const items = saved.map((s) => {
        const id = typeof s === "string" ? s : s.id;
        const read = typeof s === "string" ? true : s.read;
        const notif = notificaciones.find((n) => n.id === id);
        return notif ? { ...notif, read } : null;
      }).filter((item): item is Notificacion => Boolean(item));
      setTrash(items);
    };
    loadTrash();
    window.addEventListener("trash-updated", loadTrash);
    return () => window.removeEventListener("trash-updated", loadTrash);
  }, [user?.id, notificaciones]);

 const handleDelete = (id: string) => {
    const notif = notificaciones.find((n) => n.id === id);
    if (!notif) return;
    const trashData: { id: string; read: boolean }[] = trash.map((n) => ({ id: n.id, read: n.read }));
    if (!trashData.find((t) => t.id === id)) {
      trashData.push({ id, read: notif.read });
    }
    localStorage.setItem(`trash_notif_ids_${user?.id}`, JSON.stringify(trashData));
    const evt = new Event("trash-updated");
    (evt as any).detail = { type: "delete", id };
    window.dispatchEvent(evt);
  };

  const handleRestore = (id: string) => {
    const remaining = trash.filter((n) => n.id !== id);
    const trashData = remaining.map((n) => ({ id: n.id, read: n.read }));
    localStorage.setItem(`trash_notif_ids_${user?.id}`, JSON.stringify(trashData));
    const evt = new Event("trash-updated");
    (evt as any).detail = { type: "restore", id };
    window.dispatchEvent(evt);
  };

  const handleEmptyTrash = async () => {
    const trashIds = trash.map((n) => n.id);
    if (trashIds.length > 0) {
      await Promise.all(
        trashIds.map((id) =>
          supabase.from("Notificacion").delete().eq("id_notificacion", id)
        )
      );
    }
    localStorage.removeItem(`trash_notif_ids_${user?.id}`);
    window.dispatchEvent(new Event("trash-updated"));
    setShowConfirmModal(false);
  };

  const handleRead = async (id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("Notificacion").update({ leido: true }).eq("id_notificacion", id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
  };

  const handleMarkAll = async () => {
    if (!user?.id) return;
    setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("Notificacion").update({ leido: true }).eq("id_usuario", user.id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
  };

  const sinPapelera = useMemo(() => notificaciones.filter(
    (n) => !trash.some((t) => t.id === n.id)
  ), [notificaciones, trash]);

  const unreadCount = useMemo(() => sinPapelera.filter((n) => !n.read).length, [sinPapelera]);
  
  const visibles = useMemo(() => {
    if (activeTab === "papelera") return trash;
    if (activeTab === "no-leidas") return sinPapelera.filter((n) => !n.read);
    return sinPapelera;
  }, [sinPapelera, activeTab, trash]);

  const mostrarMarcarTodas = activeTab === "no-leidas" && unreadCount > 0;
const trashCount = trash.length;
  return (
    <div className="notification-system-theme min-h-screen bg-[var(--notification-page-bg)] text-[var(--notification-text)]">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">

        {/* Header: botón + título + espaciador en la misma fila */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => { onClose?.(); router.push("/"); }}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--notification-button)] text-[var(--notification-button-foreground)] text-sm font-bold rounded-xl hover:bg-[var(--notification-button-hover)] transition flex-shrink-0"
          >
            ← Volver al inicio
          </button>

          <h1 className="text-[var(--notification-button)] text-4xl font-black text-center tracking-widest uppercase flex-1 px-4">
            Todas las Notificaciones
          </h1>

          {/* Espaciador para centrar el título */}
          <div className="flex-shrink-0 w-[160px]" />
        </div>

        {/* Tabs + botones */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("todas")}
              className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                activeTab === "todas"
                  ? "bg-[var(--notification-button)] text-[var(--notification-button-foreground)] border-[var(--notification-button)]"
                  : "bg-transparent text-[var(--notification-button)] border-[var(--notification-button)] hover:bg-[var(--notification-button-soft)]"
              }`}
            >
              TODAS
            </button>
            <button
              onClick={() => setActiveTab("no-leidas")}
              className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                activeTab === "no-leidas"
                  ? "bg-[var(--notification-button)] text-[var(--notification-button-foreground)] border-[var(--notification-button)]"
                  : "bg-transparent text-[var(--notification-button)] border-[var(--notification-button)] hover:bg-[var(--notification-button-soft)]"
              }`}
            >
              NO LEÍDAS {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mostrarMarcarTodas && (
              <button
                onClick={handleMarkAll}
                className="px-4 py-2 text-sm font-bold bg-[var(--notification-button)] text-[var(--notification-button-foreground)] rounded-full hover:bg-[var(--notification-button-hover)] transition"
              >
                MARCAR TODAS
              </button>
            )}
            <button
              onClick={() => setActiveTab("papelera")}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                activeTab === "papelera"
                  ? "bg-[var(--notification-button)] text-[var(--notification-button-foreground)] border-[var(--notification-button)]"
                  : "bg-transparent text-[var(--notification-button)] border-[var(--notification-button)] hover:bg-[var(--notification-button-soft)]"
              }`}
            >
              <Trash2 size={14} />
              PAPELERA {trashCount > 0 ? `(${trashCount})` : ""}
            </button>
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[var(--notification-muted)] text-sm">
            Cargando notificaciones...
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <BellOff size={32} className="text-[var(--notification-muted)]" />
            <p className="text-[var(--notification-muted)] text-sm font-medium">
              No fue posible cargar las notificaciones.
            </p>
          </div>
        ) : visibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <BellOff size={32} className="text-[var(--notification-muted)]" />
            <p className="text-[var(--notification-muted)] text-sm font-medium">
              {activeTab === "no-leidas"
                ? "No tienes notificaciones no leídas."
                : "No hay notificaciones disponibles."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibles.map((n) => (
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
                isInTrash={activeTab === "papelera"}
                onRestore={handleRestore}
              />
            ))}
          </div>
        )}

        {activeTab === "papelera" && trash.length > 0 && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="text-sm text-[var(--notification-danger)] hover:underline transition font-bold mt-4"
          >
            Vaciar papelera
          </button>
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
    </div>
  );
}
