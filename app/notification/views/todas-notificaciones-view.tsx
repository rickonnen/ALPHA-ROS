"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/app/auth/AuthContext";
import { NotificationItem } from "@/app/home/components/notifications/NotificationItem";
import { BellOff, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/app/home/components/notifications/ConfirmModal";
import { ScrollArea } from "@/components/ui/scroll-area";


type Notificacion = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  type?: string;
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
        setNotificaciones((data ?? []).map((n: any) => ({
          id: n.id_notificacion,
          title: n.titulo,
          description: n.mensaje,
          read: n.leido,
          time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
          type: n.tipo ?? "general",
        })));
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
        const n = payload.new as any;
        setNotificaciones((prev) => [{
          id: n.id_notificacion, title: n.titulo, description: n.mensaje,
          read: n.leido, time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
          type: n.tipo ?? "general",
        }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const loadTrash = () => {
      const raw = localStorage.getItem(`trash_notif_ids_${user.id}`);
      if (!raw) { setTrash([]); return; }
      const saved = JSON.parse(raw);
      const items = saved.map((s: any) => {
        const id = typeof s === "string" ? s : s.id;
        const read = typeof s === "string" ? true : s.read;
        const notif = notificaciones.find((n) => n.id === id);
        return notif ? { ...notif, read } : null;
      }).filter(Boolean);
      setTrash(items);
    };
    loadTrash();
    window.addEventListener("trash-updated", loadTrash);
    return () => window.removeEventListener("trash-updated", loadTrash);
  }, [user?.id, notificaciones]);

 const handleDelete = (id: string) => {
    const notif = notificaciones.find((n) => n.id === id);
    if (!notif) return;
    const ids: string[] = trash.map((n) => n.id);
    if (!ids.includes(id)) ids.push(id);
    localStorage.setItem(`trash_notif_ids_${user?.id}`, JSON.stringify(ids));
    window.dispatchEvent(new Event("trash-updated"));
  };

  const handleRestore = (id: string) => {
    const ids = trash.filter((n) => n.id !== id).map((n) => n.id);
    localStorage.setItem(`trash_notif_ids_${user?.id}`, JSON.stringify(ids));
    window.dispatchEvent(new Event("trash-updated"));
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

  const unreadCount = useMemo(() => notificaciones.filter((n) => !n.read).length, [notificaciones]);
 const visibles = useMemo(() => {
    if (activeTab === "papelera") return trash;
    const sinPapelera = notificaciones.filter(
      (n) => !trash.some((t) => t.id === n.id)
    );
    if (activeTab === "no-leidas") return sinPapelera.filter((n) => !n.read);
    return sinPapelera;
  }, [notificaciones, activeTab, trash]);

  const mostrarMarcarTodas = activeTab === "no-leidas" && unreadCount > 0;
const trashCount = trash.length;
  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">

        {/* Header: botón + título + espaciador en la misma fila */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => { onClose?.(); router.push("/"); }}
            className="flex items-center gap-2 px-5 py-2 bg-[#2C4A5A] text-white text-sm font-bold rounded-xl hover:bg-[#1e3a4a] transition flex-shrink-0"
          >
            ← Volver al inicio
          </button>

          <h1 className="text-[#2C4A5A] text-4xl font-black text-center tracking-widest uppercase flex-1 px-4">
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
                  ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                  : "bg-transparent text-[#2C4A5A] border-[#2C4A5A] hover:bg-[#2C4A5A]/10"
              }`}
            >
              TODAS
            </button>
            <button
              onClick={() => setActiveTab("no-leidas")}
              className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                activeTab === "no-leidas"
                  ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                  : "bg-transparent text-[#2C4A5A] border-[#2C4A5A] hover:bg-[#2C4A5A]/10"
              }`}
            >
              NO LEÍDAS {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mostrarMarcarTodas && (
              <button
                onClick={handleMarkAll}
                className="px-4 py-2 text-sm font-bold bg-[#2C4A5A] text-white rounded-full hover:bg-[#1e3a4a] transition"
              >
                MARCAR TODAS
              </button>
            )}
            <button
              onClick={() => setActiveTab("papelera")}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold border-2 transition ${
                activeTab === "papelera"
                  ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                  : "bg-transparent text-[#2C4A5A] border-[#2C4A5A] hover:bg-[#2C4A5A]/10"
              }`}
            >
              <Trash2 size={14} />
              PAPELERA {trashCount > 0 ? `(${trashCount})` : ""}
            </button>
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#2C4A5A]/60 text-sm">
            Cargando notificaciones...
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <BellOff size={32} className="text-[#2C4A5A]/40" />
            <p className="text-[#2C4A5A]/60 text-sm font-medium">
              No fue posible cargar las notificaciones.
            </p>
          </div>
        ) : visibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <BellOff size={32} className="text-[#2C4A5A]/40" />
            <p className="text-[#2C4A5A]/60 text-sm font-medium">
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
            className="text-sm text-red-500 hover:text-red-700 hover:underline transition font-bold mt-4"
          >
            Vaciar papelera
          </button>
        )}

        <ConfirmModal
          isOpen={showConfirmModal}
          onConfirm={handleEmptyTrash}
          onCancel={() => setShowConfirmModal(false)}
        />
      </div>
    </div>
  );
}