"use client";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/app/auth/AuthContext";
import { NotificationItem } from "@/app/home/components/notifications/NotificationItem";
import { ConfirmModal } from "@/app/home/components/notifications/ConfirmModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";

type Notificacion = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
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
  const [mounted, setMounted] = useState(false);
  const [trash, setTrash] = useState<Notificacion[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect 1: fetch desde Supabase + realtime
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotificaciones = async () => {
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
          time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
          type: n.tipo ?? "general",
        }));

        setNotificaciones(mapped);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificaciones();

    const channel = supabase
      .channel(`todas-notif-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`,
      }, (payload) => {
        const n = payload.new as any;
        setNotificaciones((prev) => [{
          id: n.id_notificacion,
          title: n.titulo,
          description: n.mensaje,
          read: n.leido,
          time: n.creado_en ? formatRelativeTime(n.creado_en) : "ahora",
          type: n.tipo ?? "general",
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // useEffect 2: sincronizar papelera con localStorage
  useEffect(() => {
  if (!user?.id) return;
  const loadTrash = () => {
    const raw = localStorage.getItem(`trash_notif_ids_${user.id}`);
    if (!raw) { setTrash([]); return; }
    const saved = JSON.parse(raw);
    //  soporta formato nuevo {id, read} y formato viejo string[]
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

  // handleDelete: escribe en localStorage igual que el panel pequeño
  const handleDelete = (id: string) => {
    const notif = notificaciones.find((n) => n.id === id);
    if (!notif) return;
    const ids: string[] = trash.map((n) => n.id);
    if (!ids.includes(id)) ids.push(id);
    localStorage.setItem(`trash_notif_ids_${user?.id}`, JSON.stringify(ids));
    window.dispatchEvent(new Event("trash-updated"));
  };

  //  handleRestore: elimina del localStorage y dispara el evento
  const handleRestore = (id: string) => {
    const ids = trash.filter((n) => n.id !== id).map((n) => n.id);
    localStorage.setItem(`trash_notif_ids_${user?.id}`, JSON.stringify(ids));
    window.dispatchEvent(new Event("trash-updated"));
  };

  //  handleEmptyTrash: limpia localStorage
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
    setNotificaciones((prev) =>
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
    setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from("Notificacion")
      .update({ leido: true })
      .eq("id_usuario", user.id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
  };

  const unreadCount = useMemo(
    () => notificaciones.filter((n) => !n.read).length,
    [notificaciones]
  );

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center px-4 pt-[72px]"
      onClick={onClose}
    >
      <div
        className="bg-[#F5F0E8] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header azul */}
        <div className="bg-[#2C4A5A] py-5 px-6 text-center flex-shrink-0">
          <h1 className="text-white text-2xl font-bold tracking-widest uppercase">
            Todas las Notificaciones
          </h1>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Tabs + botones */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("todas")}
                className={`px-5 py-1.5 rounded-full text-sm font-bold border-2 transition ${
                  activeTab === "todas"
                    ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                    : "bg-white text-[#2C4A5A] border-[#2C4A5A] hover:bg-gray-50"
                }`}
              >
                TODAS
              </button>
              <button
                onClick={() => setActiveTab("no-leidas")}
                className={`px-5 py-1.5 rounded-full text-sm font-bold border-2 transition ${
                  activeTab === "no-leidas"
                    ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                    : "bg-white text-[#2C4A5A] border-[#2C4A5A] hover:bg-gray-50"
                }`}
              >
                NO LEÍDAS {unreadCount > 0 ? `(${unreadCount})` : ""}
              </button>
              <button
                onClick={() => setActiveTab("papelera")}
                className={`px-5 py-1.5 rounded-full text-sm font-bold border-2 transition ${
                  activeTab === "papelera"
                    ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                    : "bg-white text-[#2C4A5A] border-[#2C4A5A] hover:bg-gray-50"
                }`}
              >
                PAPELERA {trashCount > 0 ? `(${trashCount})` : ""}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {mostrarMarcarTodas && (
                <button
                  onClick={handleMarkAll}
                  className="px-4 py-1.5 text-sm font-bold bg-[#2C4A5A] text-white rounded-full hover:bg-[#1e3a4a] transition"
                >
                  MARCAR TODAS
                </button>
              )}
            </div>
          </div>

          {activeTab === "papelera" && trash.length > 0 && (
            <div className="flex justify-end px-3 pb-1 mb-2">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="text-sm text-red-500 hover:text-red-700 hover:underline transition font-bold"
              >
                Vaciar papelera
              </button>
            </div>
          )}

          {/* Lista */}
          <div className="rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                Cargando notificaciones...
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <BellOff size={22} />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  No fue posible cargar las notificaciones.
                </p>
              </div>
            ) : visibles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <BellOff size={22} />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {activeTab === "no-leidas"
                    ? "No tienes notificaciones no leídas."
                    : activeTab === "papelera"
                    ? "La papelera está vacía."
                    : "No hay notificaciones disponibles."}
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[45vh]">
                <div className="p-3 space-y-2">
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
              </ScrollArea>
            )}
          </div>

          {/* Volver al inicio */}
          <div className="mt-5">
            <button
              onClick={() => {
                onClose?.();
                router.push("/");
              }}
              className="px-6 py-2 bg-[#E8724A] text-white text-sm font-bold rounded-lg hover:bg-[#d4603a] transition"
            >
              Volver al inicio
            </button>
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleEmptyTrash}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>,
    document.body
  );
}