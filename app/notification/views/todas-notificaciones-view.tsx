"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/app/auth/AuthContext";
import { useTrash } from "@/components/hooks/useTrash";
import { NotificationItem } from "@/app/home/components/notifications/NotificationItem";
import { NotificationHeader } from "@/app/home/components/notifications/NotificationHeader";
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [pendingBulkIds, setPendingBulkIds] = useState<string[]>([]);

  const { trashIds, addToTrash, removeFromTrash, emptyTrash } = useTrash(user?.id);

  const trash = useMemo(
    () =>
      trashIds
        .map((entry) => {
          const notif = notificaciones.find((n) => n.id === entry.id);
          return notif ? { ...notif, read: entry.read } : null;
        })
        .filter(Boolean) as Notificacion[],
    [trashIds, notificaciones]
  );

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
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

        const existingIds = new Set(mapped.map((n) => n.id));
        const storageKey = `trash_notif_ids_${user.id}`;
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter((e: any) => {
                const id = typeof e === "string" ? e : e.id;
                return existingIds.has(id);
              });
              localStorage.setItem(storageKey, JSON.stringify(cleaned));
              window.dispatchEvent(new Event("trash-updated"));
            }
          }
        } catch {}
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const channel = supabase
      .channel(`todas-notif-view-${user.id}`)
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
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`
      }, (payload) => {
        const n = payload.new as any;
        setNotificaciones((prev) => prev.map((notif) =>
          notif.id === n.id_notificacion ? { ...notif, read: n.leido } : notif
        ));
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`
      }, (payload) => {
        const n = payload.old as any;
        setNotificaciones((prev) =>
          prev.filter((notif) => notif.id !== n.id_notificacion)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => { setSelectedIds([]); }, [activeTab]);

  const handleDelete = (id: string) => {
    const notif = notificaciones.find((n) => n.id === id);
    if (!notif) return;
    addToTrash({ id, read: notif.read });
  };

  const handleRestore = (id: string) => {
    removeFromTrash(id);
  };

  const handleEmptyTrash = async () => {
    const ids = trash.map((n) => n.id);
    setNotificaciones((prev) => prev.filter((n) => !ids.includes(n.id)));
    emptyTrash();
    setShowConfirmModal(false);
    if (ids.length > 0) {
      await Promise.all(
        ids.map((id) => supabase.from("Notificacion").delete().eq("id_notificacion", id))
      );
    }
  };

  const handleRead = async (id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("Notificacion").update({ leido: true }).eq("id_notificacion", id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const handleMarkAll = async () => {
    if (!user?.id) return;
    setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("Notificacion").update({ leido: true }).eq("id_usuario", user.id);
    window.dispatchEvent(new Event("refresh-notification-badge"));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => setSelectedIds(visibles.map((n) => n.id));
  const handleDeselectAll = () => setSelectedIds([]);

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => handleDelete(id));
    setSelectedIds([]);
  };

  const handleBulkMarkRead = async () => {
    setNotificaciones((prev) =>
      prev.map((n) => selectedIds.includes(n.id) ? { ...n, read: true } : n)
    );
    await supabase.from("Notificacion").update({ leido: true }).in("id_notificacion", selectedIds);
    window.dispatchEvent(new Event("refresh-notification-badge"));
    window.dispatchEvent(new Event("notifications-updated"));
    setSelectedIds([]);
  };

  const handleBulkRestore = () => {
    selectedIds.forEach((id) => handleRestore(id));
    setSelectedIds([]);
  };

  const handleBulkDeleteFromTrash = () => {
    setPendingBulkIds([...selectedIds]);
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDeleteFromTrash = async () => {
    const ids = [...pendingBulkIds];
    setSelectedIds([]);
    setPendingBulkIds([]);
    setShowBulkDeleteModal(false);
    setNotificaciones((prev) => prev.filter((n) => !ids.includes(n.id)));
    ids.forEach((id) => removeFromTrash(id));
    await supabase.from("Notificacion").delete().in("id_notificacion", ids);
  };

  const sinPapelera = useMemo(() =>
    notificaciones.filter((n) => !trashIds.some((t) => t.id === n.id)),
    [notificaciones, trashIds]
  );

  const unreadCount = useMemo(() => sinPapelera.filter((n) => !n.read).length, [sinPapelera]);

  const visibles = useMemo(() => {
    if (activeTab === "papelera") return trash;
    if (activeTab === "no-leidas") return sinPapelera.filter((n) => !n.read);
    return sinPapelera;
  }, [sinPapelera, activeTab, trash]);

  const mostrarMarcarTodas = activeTab === "no-leidas" && unreadCount > 0;
  const trashCount = trash.length;
  const isTrashTab = activeTab === "papelera";

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">

        <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
          <NotificationHeader
            totalCount={sinPapelera.length}
            selectedIds={selectedIds}
            allIds={visibles.map((n) => n.id)}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkDelete={isTrashTab ? handleBulkDeleteFromTrash : handleBulkDelete}
            onBulkMarkRead={isTrashTab ? undefined : handleBulkMarkRead}
            isInTrash={isTrashTab}
            onBulkRestore={isTrashTab ? handleBulkRestore : undefined}
          />
        </div>

        {/* Header con Volver y Título */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <button
            onClick={() => { onClose?.(); router.push("/"); }}
            className="flex items-center gap-2 px-3 md:px-5 py-2 bg-[#2C4A5A] text-white text-xs md:text-sm font-bold rounded-xl hover:bg-[#1e3a4a] transition shrink-0 w-fit"
          >
            ← Volver
          </button>
          <h1 className="text-[#2C4A5A] text-lg md:text-4xl font-black text-center tracking-widest uppercase flex-1 px-2 md:px-4">
            Todas las Notificaciones
          </h1>
          <div className="hidden md:block md:shrink-0 md:w-40" />
        </div>

        {/* Tabs: izquierda TODAS + NO LEÍDAS, derecha MARCAR TODAS + PAPELERA */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5 md:gap-2 items-center flex-nowrap">
            <button
              onClick={() => setActiveTab("todas")}
              className={`px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold border-2 transition ${
                activeTab === "todas"
                  ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                  : "bg-transparent text-[#2C4A5A] border-[#2C4A5A] hover:bg-[#2C4A5A]/10"
              }`}
            >
              TODAS
            </button>
            <button
              onClick={() => setActiveTab("no-leidas")}
              className={`px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold border-2 transition ${
                activeTab === "no-leidas"
                  ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                  : "bg-transparent text-[#2C4A5A] border-[#2C4A5A] hover:bg-[#2C4A5A]/10"
              }`}
            >
              NO LEÍDAS {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          <div className="flex gap-1.5 md:gap-2 items-center flex-nowrap">
            {mostrarMarcarTodas && (
              <button
                onClick={handleMarkAll}
                className="px-2.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold bg-[#2C4A5A] text-white rounded-full hover:bg-[#1e3a4a] transition"
              >
               <span className="hidden md:inline">MARCAR TODAS</span>
<span className="md:hidden">MARCAR TODAS</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("papelera")}
              className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold border-2 transition ${
                isTrashTab
                  ? "bg-[#2C4A5A] text-white border-[#2C4A5A]"
                  : "bg-transparent text-[#2C4A5A] border-[#2C4A5A] hover:bg-[#2C4A5A]/10"
              }`}
            >
              <Trash2 size={14} />
              <span className="hidden md:inline">PAPELERA</span>
              {trashCount > 0 ? ` (${trashCount})` : ""}
            </button>
          </div>
        </div>

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
                isInTrash={isTrashTab}
                onRestore={handleRestore}
                isSelected={selectedIds.includes(n.id)}
                onToggleSelect={handleToggleSelect}
                selectionMode={selectedIds.length > 0}
              />
            ))}
          </div>
        )}

        {isTrashTab && trash.length > 0 && (
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

        <ConfirmModal
          isOpen={showBulkDeleteModal}
          onConfirm={confirmBulkDeleteFromTrash}
          onCancel={() => { setShowBulkDeleteModal(false); setPendingBulkIds([]); }}
        />
      </div>
    </div>
  );
}