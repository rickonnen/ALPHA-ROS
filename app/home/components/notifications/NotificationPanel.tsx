"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem";
import { SettingsPanel } from "./SettingsPanel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BellOff } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  time?: string;
  createdAt?: string | null;
  type: 1 | 2 | 3;
};

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "ahora";
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} h`;
    return `hace ${days} d`;
  } catch {
    return "fecha desconocida";
  }
}

export function NotificationPanel() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("notificacion_campana")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data) {
          setNotifications([]);
          return;
        }

        const mapped: Notification[] = data.map((n: any) => {
          let typeNum: 1 | 2 | 3 = 3;
          if (n.type === "gmail") typeNum = 1;
          else if (n.type === "whatsapp") typeNum = 2;
          return {
            id: String(n.id),
            title: n.title || "Sin título",
            description: n.message || "Sin contenido",
            read: n.read || false,
            createdAt: n.created_at || null,
            time: n.created_at ? formatRelativeTime(n.created_at) : "ahora",
            type: typeNum,
          };
        });

        setNotifications(mapped);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("notificacion-campana-global")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "notificacion_campana",
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          const n = payload.new as any;
          let typeNum: 1 | 2 | 3 = 3;
          if (n.type === "gmail") typeNum = 1;
          else if (n.type === "whatsapp") typeNum = 2;
          const nueva: Notification = {
            id: String(n.id),
            title: n.title || "Sin título",
            description: n.message || "Sin contenido",
            read: n.read || false,
            createdAt: n.created_at || null,
            time: n.created_at ? formatRelativeTime(n.created_at) : "ahora",
            type: typeNum,
          };
          setNotifications((prev) => [nueva, ...prev]);
        }
        if (payload.eventType === "UPDATE") {
          setNotifications((prev) =>
            prev.map((n) => n.id === String(payload.new.id) ? { ...n, read: payload.new.read } : n)
          );
        }
        if (payload.eventType === "DELETE") {
          setNotifications((prev) => prev.filter((n) => n.id !== String(payload.old.id)));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await supabase.from("notificacion_campana").update({ read: true }).eq("id", id);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notificacion_campana").delete().eq("id", id);
  }, []);

  const handleGmailToggle = useCallback((enabled: boolean) => {
    setGmailEnabled(enabled);
    localStorage.setItem(`gmail_enabled_${user?.id ?? "guest"}`, String(enabled));
  }, [user?.id]);

  const handleWhatsappToggle = useCallback((enabled: boolean) => {
    setWhatsappEnabled(enabled);
    localStorage.setItem(`whatsapp_enabled_${user?.id ?? "guest"}`, String(enabled));
  }, [user?.id]);

  // 1. FILTRO MAESTRO
  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.type === 1 && !gmailEnabled) return false;
      if (n.type === 2 && !whatsappEnabled) return false;
      return true;
    });
  }, [notifications, gmailEnabled, whatsappEnabled]);

  // 2. CONTEO
  const unreadCount = useMemo(() => {
    return activeNotifications.filter((n) => !n.read).length;
  }, [activeNotifications]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("optimistic-unread-sync", { detail: unreadCount }));
  }, [unreadCount]);

  // 3. VISTA FINAL
  const visibleNotifications = useMemo(() => {
    let filtered = activeNotifications; 

    if (activeTab === "unread") {
      filtered = filtered.filter((n) => !n.read);
    }

    if (activeFilter === "gmail") {
      filtered = filtered.filter((n) => n.type === 1);
    } else if (activeFilter === "whatsapp") {
      filtered = filtered.filter((n) => n.type === 2);
    }

    return filtered;
  }, [activeNotifications, activeTab, activeFilter]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90vw] max-w-[420px] rounded-2xl shadow-xl bg-white flex flex-col overflow-hidden md:absolute md:top-full md:mt-3 md:left-auto md:right-0 md:translate-x-0 border border-gray-100">
      
      {showSettings ? (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          gmailEnabled={gmailEnabled}
          whatsappEnabled={whatsappEnabled}
          onGmailToggle={handleGmailToggle}
          onWhatsappToggle={handleWhatsappToggle}
        />
      ) : (
        <>
          <NotificationHeader unreadCount={unreadCount} />
          
          <div className="px-4 pt-3 pb-2">
            <NotificationTabs
              activeTab={activeTab}
              onTabChange={(tab) => { setActiveTab(tab); setActiveFilter("all"); }}
              unreadCount={unreadCount}
              activeFilter={activeFilter}
              onFilterChange={(f) => setActiveFilter(f)}
              onOpenSettings={() => setShowSettings(true)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
              Cargando...
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm gap-2">
              <BellOff size={32} className="text-gray-300" />
              <span>No tienes notificaciones visibles.</span>
            </div>
          ) : (
            <ScrollArea className="flex-1 max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
              <div className="p-2 space-y-2 pb-4">
                {visibleNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    {...n}
                    onRead={handleRead}
                    onDelete={handleDelete}
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